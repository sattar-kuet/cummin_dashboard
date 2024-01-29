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
        maintenance_requests = request.env['maintenance.request'].search([])
        wip_cost = 0
        wip_billable_amount = 0
        for maintenance_request in maintenance_requests:
            wip_cost += maintenance_request.wip_cost
            wip_billable_amount += maintenance_request.billed_hours
        kpi_data = {
            'growthMindSet': {
                'woCount': {
                    'open': 100,
                    'invoiced': 110,
                    'serviceOperatingSales': 220,
                },
                'wip':{
                    'woCount': 200,
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
        }
        return json.dumps(kpi_data)