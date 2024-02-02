import json
import requests
from odoo import http, fields
from odoo.http import request
from odoo.osv import expression
from datetime import datetime, timezone, timedelta


class Api(http.Controller):

    @http.route('/distributor/list', auth="user", type="json")
    def distributor_list(self, **data):
        distributors = request.env['res.company'].search([])
        distributor_list = []
        for distributor in sorted(distributors, key=lambda x: x.name):
            if distributor.name:
                distributor_list.append({
                    "id": distributor.id,
                    "name": distributor.name,
                    "key": distributor.id
                })
        return json.dumps(distributor_list)
    
    @http.route('/country/list', auth="user", type="json")
    def country_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        country_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.country:
                country_list.append({
                    "id": maintenance_request.country,
                    "name": maintenance_request.country,
                    "key": f'country{maintenance_request.id}'
                })
           
        return json.dumps(country_list)
    
    @http.route('/branch/list', auth="user", type="json")
    def branch_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        branch_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.branch:
                branch_list.append({
                    "id": maintenance_request.branch,
                    "name": maintenance_request.branch,
                    "key": f'branch{maintenance_request.id}'
                })
           
        return json.dumps(branch_list)
    
    @http.route('/currency/list', auth="user", type="json")
    def currency_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        currency_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.currency:
                currency_list.append({
                    "id": maintenance_request.currency,
                    "name": maintenance_request.currency,
                    "key": f'currency{maintenance_request.id}'
                })
           
        return json.dumps(currency_list)
    
    @http.route('/kpi/load_initial_data', auth="user", type="json")
    def load_initial_data(self,**data):
        maintenance_request_list_view_obj = http.request.env['ir.model.data'].sudo().search(
            [('name', '=', 'hr_equipment_request_view_tree')]
            , limit=1)
        maintenance_request_tree_view_res_id = False
        if maintenance_request_list_view_obj:
            maintenance_request_tree_view_res_id = maintenance_request_list_view_obj.res_id
        initial_dta = {
            'maintenanceRequestTreeViewResId': maintenance_request_tree_view_res_id
        }
        return json.dumps(initial_dta)
    
    @http.route('/kpi/data', auth="user", type="json")
    def kpi_data(self, **data):
        
        domain = []
        time_sheet_domain = []
        if data:
           company_id = int(data['distributorId'])
           if company_id > 0:
               domain.append(('company_id', '=', company_id))

           if data['periodStartAt']:
               domain.append(('request_date', '>=', data['periodStartAt']))
               time_sheet_domain.append(('date', '>=', data['periodStartAt']))
            
           if data['periodEndAt']:
               domain.append(('request_date', '<=', data['periodEndAt']))
               time_sheet_domain.append(('date', '<=', data['periodEndAt']))

           if data['country']:
               domain.append(('country', '=', data['country']))

           if data['branch']:
               domain.append(('branch', '=', data['branch']))

           if data['currency']:
               domain.append(('currency', '=', data['currency']))
            

        maintenance_requests = request.env['maintenance.request'].search(domain)
        wip_cost = 0
        wip_cost_ids = []
        wip_billable_amount = 0
        wip_billable_ids = []
        wo_count = 0
        wo_count_ids = []
        wo_open = 0
        wo_invoiced = 0
        billed_hours = 0
        billable_hours = 0
        maintenance_request_open_ids = []
        maintenance_request_invoiced_ids = []
        
        for maintenance_request in maintenance_requests:
            if maintenance_request.invoice:
              wo_invoiced += 1
              maintenance_request_invoiced_ids.append(maintenance_request.id)
            else:
                wo_open += 1
                maintenance_request_open_ids.append(maintenance_request.id)
            if maintenance_request.stage_id.name == 'Closure':
                billable_hours += maintenance_request.billed_hours
            else:
               wip_billable_amount += maintenance_request.billed_hours
               wip_billable_ids.append(maintenance_request.id)
               wo_count += 1
               wo_count_ids.append(maintenance_request.id)
               wip_cost += maintenance_request.wip_cost
               wip_cost_ids.append(maintenance_request.id)

            billed_hours += maintenance_request.billed_hours

        account_analytics = request.env['account.analytic.line'].search(time_sheet_domain)
        
        total_hours = 0
        benifit_hours = 0
        applied_hours = 0
        for account_analytic in account_analytics:
            total_hours += account_analytic.unit_amount
            if account_analytic.task in ['0410','0710','0711','0712']:
                benifit_hours += account_analytic.unit_amount
            if account_analytic.task in ['0104','0105','0107','0108','0800']:
                applied_hours += account_analytic.unit_amount

        payroll_hours = total_hours
        available_hours = payroll_hours - benifit_hours
       
        kpi_data = {
            'growthMindSet': {
                'woCount': {
                    'open': wo_open,
                    'openIds': maintenance_request_open_ids,
                    'invoiced': wo_invoiced,
                    'invoicedIds': maintenance_request_invoiced_ids,
                    'serviceOperatingSales': 220,
                },
                'wip':{
                    'woCount': wo_count,
                    'cost': wip_cost,
                    'billableAmount': wip_billable_amount,
                    'ids': wip_billable_ids
                }
            },
            
            'operationalEfficiencies': {
                'tb': request.env['cummin_dashboard.helper'].calculate_percentage(total_hours,billed_hours),
                'productivity': request.env['cummin_dashboard.helper'].calculate_percentage(payroll_hours,benifit_hours), 
                'labourUtilization': request.env['cummin_dashboard.helper'].calculate_percentage(applied_hours,available_hours),
                'billingEfficiency': request.env['cummin_dashboard.helper'].calculate_percentage(billed_hours,applied_hours)
            },
            'parameter': data
        }
        # return {'ids':wip_billable_ids, 'amount':wip_billable_amount,'stage_id':stage_id}
        return json.dumps(kpi_data)