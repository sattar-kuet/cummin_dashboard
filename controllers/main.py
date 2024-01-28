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
            # country_list.append({
            #     "id": maintenance_request.country.id,
            #     "name": maintenance_request.country.name
            # })
            return maintenance_request.country
        # return json.dumps(country_list)