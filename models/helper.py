from odoo import fields, models
from datetime import datetime, timedelta
from ..constants import PRODUCTIVE_HOURS
from math import ceil
import math

class Helper(models.AbstractModel): 
    _name = 'cummin_dashboard.helper'


    def calculate_percentage(self, numerator,denominator):
        if numerator == 0 and denominator == 0:
            return 0
        if denominator == 0:
            return 'Inifinity'
        return round(numerator/denominator,2)
    
   
    def get_filtering_domain(self,data):
        maintenance_request_domain = []
        time_sheet_domain = []
        if data:
           company_id = int(data['distributorId'])
           if company_id > 0:
               cr = self.env.cr
               sql_query = """
                    SELECT user_id 
                    FROM res_company_users_rel 
                    WHERE cid = %s
                """
               cr.execute(sql_query, (company_id,))
               user_ids = [row[0] for row in cr.fetchall()]
               maintenance_request_domain.append(('create_uid', 'in', user_ids))

           if data['periodStartAt']:
               maintenance_request_domain.append(('request_date', '>=', data['periodStartAt']))
               time_sheet_domain.append(('date', '>=', data['periodStartAt']))
            
           if data['periodEndAt']:
               maintenance_request_domain.append(('request_date', '<=', data['periodEndAt']))
               time_sheet_domain.append(('date', '<=', data['periodEndAt']))

           if data['country']:
               maintenance_request_domain.append(('country', '=', data['country']))

           if data['branch']:
               maintenance_request_domain.append(('branch', '=', data['branch']))

           if data['currency']:
               maintenance_request_domain.append(('currency', '=', data['currency']))
        return maintenance_request_domain,time_sheet_domain
    
    def order_count_detail(self,domain):
            maintenance_requests = self.env['maintenance.request'].search(domain)
            order_count = 0
            order_0_30 = 0
            order_31_80 = 0
            order_81_infinity = 0
            maintenance_request_ids = []
            for maintenance_request in maintenance_requests:
            #   if maintenance_request.stage_id.name != 'Closure':
                if not  maintenance_request.invoice:
                   order_count +=1
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,0,30):
                    order_0_30 += 1
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,31,80):
                    order_31_80 += 1
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,81,-1):
                    order_81_infinity += 1
                maintenance_request_ids.append(maintenance_request.id)
            return maintenance_request_ids,order_count,order_0_30,order_31_80,order_81_infinity
    
    def labour_hours_detail(self,domain):
            domain.append(('task','in',PRODUCTIVE_HOURS))
            time_sheets = self.env['account.analytic.line'].search(domain)
            labour_hours = 0.0
            for time_sheet in time_sheets:
                labour_hours += self.convert_time_from_float(time_sheet.unit_amount)
            labour_hours = "{:.{}f}".format(labour_hours, 2)

            return labour_hours
    
    def billable_amount_detail(self,domain):
        maintenance_requests = self.env['maintenance.request'].search(domain)
        billable_amount = 0
        billable_amount_0_30 = 0
        billable_amount_31_80 = 0
        billable_amount_81_inifinity = 0
        for maintenance_request in maintenance_requests:
            total_sales = maintenance_request.labour_sales + maintenance_request.parts_sales + maintenance_request.other_sales
            billable_amount += total_sales
            if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,0,30):
               billable_amount_0_30 += total_sales
            elif self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,31,80):
               billable_amount_31_80 += total_sales
            elif self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,81,-1):
               billable_amount_81_inifinity += total_sales
        return billable_amount, billable_amount_0_30, billable_amount_31_80, billable_amount_81_inifinity
    
    def cost_detail(self, domain):
        maintenance_requests = self.env['maintenance.request'].search(domain)
        cost = 0
        cost_0_30 = 0
        cost_31_80 = 0
        cost_81_inifinity = 0
        for maintenance_request in maintenance_requests:
            cost += maintenance_request.wip_cost
            if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,0,30):
               cost_0_30 += maintenance_request.wip_cost
            elif self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,31,80):
               cost_31_80 += maintenance_request.wip_cost
            elif self.env['cummin_dashboard.helper'].between_x1_x2_days_older(maintenance_request.create_date,81,-1):
               cost_81_inifinity += maintenance_request.wip_cost
        return cost, cost_0_30, cost_31_80, cost_81_inifinity

    
    def get_countries(self):
        unique_countries = self.env['maintenance.request'].sudo().search([]).mapped('country')
        unique_countries = list(set(unique_countries))
        return unique_countries
    
    @staticmethod
    def convert_time_from_float(time_data):
        fractional, hour = math.modf(time_data)
        minute = round(fractional*60)
        minute = minute/100
        time = hour + minute
        return time
    
    @staticmethod
    def between_x1_x2_days_older(given_date,x1,x2):
        current_date = datetime.now().date()
        create_date = fields.Datetime.to_datetime(given_date).date()
        days_difference = (current_date - create_date).days
        if x1 <= days_difference and (days_difference <= x2 or x2 == -1):
            return True
        return False