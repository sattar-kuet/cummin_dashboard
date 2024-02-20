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
            return order_count,order_0_30,order_31_80,order_81_infinity
    
    def labour_hours_detail(self,domain):
            domain.append(('task','in',PRODUCTIVE_HOURS))
            time_sheets = self.env['account.analytic.line'].search(domain)
            labour_hours = 0.0
            labour_hours_0_30 = 0
            labour_hours_31_80 = 0
            labour_hours_81_infinity = 0
            for time_sheet in time_sheets:
                labour_hours += self.convert_time_from_float(time_sheet.unit_amount)
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(time_sheet.date,0,30):
                    labour_hours_0_30 += self.convert_time_from_float(time_sheet.unit_amount)
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(time_sheet.date,31,80):
                    labour_hours_31_80 += self.convert_time_from_float(time_sheet.unit_amount)
                if self.env['cummin_dashboard.helper'].between_x1_x2_days_older(time_sheet.date,80,-1):
                    labour_hours_81_infinity += self.convert_time_from_float(time_sheet.unit_amount)
                #  labour_hours = self.sum_time_durations(labour_hours,time_sheet.unit_amount)
            labour_hours = "{:.{}f}".format(labour_hours, 2)
            labour_hours_0_30 = "{:.{}f}".format(labour_hours_0_30, 2)
            labour_hours_31_80 = "{:.{}f}".format(labour_hours_31_80, 2)
            labour_hours_81_infinity = "{:.{}f}".format(labour_hours_81_infinity, 2)

            return labour_hours,labour_hours_0_30,labour_hours_31_80,labour_hours_81_infinity
    
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