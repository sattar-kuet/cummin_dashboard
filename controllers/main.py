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
            distributor_list.append({
                "id": distributor.id,
                "name": distributor.name
            })
        return json.dumps(distributor_list)
    
    @http.route('/country/list', auth="user", type="json")
    def country_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        country_list = []
        for maintenance_request in maintenance_requests:
            country_list.append({
                "id": maintenance_request.country,
                "name": maintenance_request.country
            })
           
        return json.dumps(country_list)
    
    @http.route('/branch/list', auth="user", type="json")
    def branch_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        branch_list = []
        for maintenance_request in maintenance_requests:
            branch_list.append({
                "id": maintenance_request.branch,
                "name": maintenance_request.branch
            })
           
        return json.dumps(branch_list)
    
    @http.route('/currency/list', auth="user", type="json")
    def currency_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        currency_list = []
        for maintenance_request in maintenance_requests:
            currency_list.append({
                "id": maintenance_request.currency,
                "name": maintenance_request.currency
            })
           
        return json.dumps(currency_list)
    
    @http.route('/kpi/data', auth="user", type="json")
    def kpi_data(self, **data):
        domain = []
        if data:
           company_id = int(data['distributorId'])
           if company_id > 0:
               domain.append(('company_id', '=', company_id))

           if data['periodStartAt']:
               domain.append(('request_date', '>=', data['periodStartAt']))
            
           if data['periodEndAt']:
               domain.append(('request_date', '<=', data['periodEndAt']))

           if data['country']:
               domain.append(('country', '=', data['country']))

           if data['branch']:
               domain.append(('branch', '=', data['branch']))

           if data['currency']:
               domain.append(('currency', '=', data['currency']))
            

        maintenance_requests = request.env['maintenance.request'].search(domain)
        wip_cost = 0
        wip_billable_amount = 0
        wo_count = 0
        wo_open = 0
        wo_invoiced = 0
        for maintenance_request in maintenance_requests:
            wip_cost += maintenance_request.wip_cost
            wip_billable_amount += maintenance_request.billed_hours
            wo_count += 1
            if maintenance_request.invoice:
              wo_invoiced += 1
            else:
                wo_open += 1

        kpi_data = {
            'growthMindSet': {
                'woCount': {
                    'open': wo_open,
                    'invoiced': wo_invoiced,
                    'serviceOperatingSales': 220,
                },
                'wip':{
                    'woCount': wo_count,
                    'cost': wip_cost,
                    'billableAmount': wip_billable_amount,
                }
            },
            'positivelyImpactingEmployees': {
                'recordableIncidentRate': 300,
                'nearHitMissRate': 310,
                'jsoCompletionRate': 320,
                'na': 330,
            },
            'operationalEfficiencies': {
                'tb': 10,
                'Productivity': 11,
                'labourUtilization': 12,
                'na': 13,
            },
            'parameter': data
        }
        return json.dumps(kpi_data)