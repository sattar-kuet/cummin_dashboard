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