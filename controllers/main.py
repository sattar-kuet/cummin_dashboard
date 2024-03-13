import json
import requests
from odoo import http, fields
from odoo.http import request
from odoo.osv import expression
from datetime import datetime, timezone, timedelta


class Api(http.Controller):

    @http.route('/distributor/list', auth="user", type="json")
    def distributor_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].sudo().search([])
        distributor_list = []
        company_considered = []
        for maintenance_request in maintenance_requests:
            company = maintenance_request.create_uid.company_id
            if company.id in company_considered:
                continue
            company_considered.append(company.id)
            distributor_list.append({
                    "id": company.id,
                    "name": company.name,
                    "key": company.id
                })
        
        return json.dumps(distributor_list)
    
    @http.route('/country/list', auth="user", type="json")
    def country_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        country_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.country and maintenance_request.country not in country_list:
                country_list.append(maintenance_request.country)
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
        # for maintenance_request in maintenance_requests:
        #     if maintenance_request.currency:
        #         currency_list.append({
        #             "id": maintenance_request.currency,
        #             "name": maintenance_request.currency,
        #             "key": f'currency{maintenance_request.id}'
        #         })
        currency_list.append({
                    "id": 'USD',
                    "name": 'USD',
                    "key": 'currency1'
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

        account_analytic_line_tree_view_obj = http.request.env['ir.model.data'].sudo().search(
            [('name', '=', 'hr_timesheet.hr_timesheet_line_tree')]
            , limit=1)
        account_analytic_line_tree_view_res_id = False
        if account_analytic_line_tree_view_obj:
            account_analytic_line_tree_view_res_id = account_analytic_line_tree_view_obj.res_id

        initial_dta = {
            'maintenanceRequestTreeViewResId': maintenance_request_tree_view_res_id,
             'accountAnalyticTreeViewResId': account_analytic_line_tree_view_res_id
        }
        return json.dumps(initial_dta)
    
    @http.route('/session/info', auth="user", type="json")
    def session_info(self, **data):
        session_info = {
            'admin':  request.env.user.has_group('cummin_dashboard.group_cummin_admin'), 
            'distributor':  request.env.user.has_group('cummin_dashboard.group_distributor'), 
            'technician':  request.env.user.has_group('cummin_dashboard.group_technician'), 
            'supervisor':  request.env.user.has_group('cummin_dashboard.group_supervisor'), 
            'company_ids': request.env.user.company_ids.ids,
            'company_names': [company.name for company in request.env.user.company_ids]
        }
        return json.dumps(session_info)
    
    @http.route('/home/load_initial_data', auth="user", type="json")
    def load_initial_data(self, **data):
        service_order_list_view_obj = http.request.env['ir.model.data'].sudo().search(
            [('name', '=', 'maintenance_request_view_inherit')]
            , limit=1)
        service_order_view_res_id = False
        if service_order_list_view_obj:
            service_order_view_res_id = service_order_list_view_obj.res_id
        initial_data = {
            'serviceOrderTreeViewResId':  service_order_view_res_id
        }
        return json.dumps(initial_data)
    
    @http.route('/kpi/data', auth="user", type="json")
    def kpi_data(self, **data):
        domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data)
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
        service_operating_sales = 0
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
                service_operating_sales += maintenance_request.labour_sales + maintenance_request.parts_sales + maintenance_request.other_sales
            else:
               wip_billable_amount += maintenance_request.labour_sales + maintenance_request.parts_sales + maintenance_request.other_sales
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
        tb_detail = {}
        productivity_ids = []
        applied_hours_ids = []
        for account_analytic in account_analytics:
            total_hours += account_analytic.unit_amount
            if account_analytic.task in ['0410','0710','0711','0712']:
                benifit_hours += account_analytic.unit_amount
                productivity_ids.append(account_analytic.id)
            if account_analytic.task in ['0104','0105','0107','0108','0800']:
                applied_hours += account_analytic.unit_amount
                applied_hours_ids.append(account_analytic.id)

        payroll_hours = total_hours
        available_hours = payroll_hours - benifit_hours
       
        kpi_data = {
            'growthMindSet': {
                'woCount': {
                    'open': wo_open,
                    'openIds': maintenance_request_open_ids,
                    'invoiced': wo_invoiced,
                    'invoicedIds': maintenance_request_invoiced_ids,
                    'serviceOperatingSales': service_operating_sales,
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
                'tbDetail': {'totalHours': total_hours, 'billedHours':billed_hours},
                'productivity': request.env['cummin_dashboard.helper'].calculate_percentage(payroll_hours,benifit_hours), 
                'productivity_ids': productivity_ids,
                'labourUtilization': request.env['cummin_dashboard.helper'].calculate_percentage(applied_hours,available_hours),
                'billingEfficiency': request.env['cummin_dashboard.helper'].calculate_percentage(billed_hours,applied_hours),
                'applied_hours_ids': applied_hours_ids
            },
            'parameter': data
        }
        # return {'ids':wip_billable_ids, 'amount':wip_billable_amount,'stage_id':stage_id}
        return json.dumps(kpi_data)
    

    @http.route('/wo_aging/table_data', auth="user", type="json")
    def wo_aging_table_data(self, **data): 
        countries = data['country']
        del data['country']
        maintenance_request_domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data) 
        # maintenance_request_domain.remove(('country','in', data['country']))
        # return maintenance_request_domain
        # print('*'*100,maintenance_request_domain)
        if len(countries)==0:
           countries = request.env['cummin_dashboard.helper'].get_countries()
        countries = list(set(countries))
        total_order_count = 0
        total_order_0_30 = 0
        total_order_31_60 = 0
        total_order_61_90 = 0
        total_order_91_infinity = 0
        total_labour_hours = 0
        total_billable_amount = 0
        total_billable_amount_0_30 = 0
        total_billable_amount_31_60 = 0
        total_billable_amount_61_90 = 0
        total_billable_amount_91_infinity = 0
        total_cost_0_30 = 0
        total_cost_31_60 = 0
        total_cost_61_90 = 0
        total_cost_91_infinity = 0
        total_cost = 0
        table_rows = []
        key = 0
        for country in countries:
            country_name = '-'
            if country:
                country_name = country
            maintenance_request_domain_with_perfect_country = [item for item in maintenance_request_domain if item[0] != 'country']
            maintenance_request_domain_with_perfect_country.append(('country','=', country))
            
            maintenance_request_ids,order_count,order_0_30,order_31_60,order_61_90,order_91_infinity = request.env['cummin_dashboard.helper'].order_count_detail(maintenance_request_domain_with_perfect_country)
            time_sheet_domain.append(('maintenance_request_id','in',maintenance_request_ids))
            # print('*'*100,maintenance_request_domain_with_perfect_country,order_count,country)

            labour_hours = request.env['cummin_dashboard.helper'].labour_hours_detail(time_sheet_domain)
            billable_amount, billable_amount_0_30, billable_amount_31_60 ,billable_amount_61_90, billable_amount_91_inifinity = request.env['cummin_dashboard.helper'].billable_amount_detail(maintenance_request_domain_with_perfect_country)
            cost, cost_0_30, cost_31_60, cost_61_90, cost_91_inifinity = request.env['cummin_dashboard.helper'].cost_detail(maintenance_request_domain_with_perfect_country)
            total_order_count += int(order_count)
            total_order_0_30 += int(order_0_30)
            total_order_31_60 += int(order_31_60)
            total_order_61_90 += int(order_61_90)
            total_order_91_infinity += int(order_91_infinity)
            total_labour_hours += float(labour_hours)
            total_billable_amount += float(billable_amount)
            total_billable_amount_0_30 += float(billable_amount_0_30)
            total_billable_amount_31_60 += float(billable_amount_31_60)
            total_billable_amount_61_90 += float(billable_amount_61_90)
            total_billable_amount_91_infinity += float(billable_amount_91_inifinity)

            total_cost += float(cost)
            total_cost_0_30 += float(cost_0_30)
            total_cost_31_60 += float(cost_31_60)
            total_cost_61_90 += float(cost_61_90)
            total_cost_91_infinity += float(total_cost_91_infinity)
            key += 1 
            table_rows.append({
                "key": key,
                "country_name": country_name,
                "order_count": order_count,
                "order_0_30": order_0_30,
                "order_31_60": order_31_60,
                "order_61_90": order_61_90,
                "order_91_infinity": order_91_infinity,
                "labour_hours": labour_hours,
                "billable_amount_0_30": billable_amount_0_30,
                "billable_amount_31_60": billable_amount_31_60,
                "billable_amount_81_inifinity": billable_amount_91_inifinity,
                "billable_amount": billable_amount,
                "cost_0_30": cost_0_30,
                "cost_31_60": cost_31_60,
                "cost_61_90": cost_61_90,
                "cost_91_inifinity": cost_91_inifinity,
                "cost": cost,
                })
        total = {
            "order_count": total_order_count,
            "order_0_30": total_order_0_30,
            "order_31_60": total_order_31_60,
            "order_61_90": total_order_61_90,
            "order_91_infinity": total_order_91_infinity,
            "labour_hours": total_labour_hours,
            "billable_amount_0_30": total_billable_amount_0_30,
            "billable_amount_31_60": total_billable_amount_31_60,
            "billable_amount_61_90": total_billable_amount_61_90,
            "billable_amount_91_inifinity": total_billable_amount_91_infinity,
            "billable_amount": total_billable_amount,
            "cost_0_30": total_cost_0_30,
            "cost_31_60": total_cost_31_60,
            "cost_61_90": total_cost_61_90,
            "cost_91_inifinity": total_cost_91_infinity,
            "cost": total_cost
        }
        table_data = {
            'rows': table_rows,
            'total': total
        }
        return json.dumps(table_data)
    
    @http.route('/wo_aging/chart_data', auth="user", type="json")
    def wo_aging_chart_data(self, **data):
        countries = data['country']
        if len(countries)==0:
           countries = request.env['cummin_dashboard.helper'].get_countries()
        countries = list(set(countries))
        labels = []
        bg_0_30 = []
        bg_31_60 = []
        bg_61_90 = []
        bg_91_infinity = []
        data_0_30 = []
        data_31_60 = []
        data_61_90 = []
        data_91_infinity = []
        maintenance_request_domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data) 
        for country in countries:
            maintenance_request_domain.append(('country','=', country))
            maintenance_request_ids,order_count,order_0_30,order_31_60,order_61_90,order_91_infinity = request.env['cummin_dashboard.helper'].order_count_detail(maintenance_request_domain)
            if not country:
                country = '-'
            labels.append(country)
            bg_0_30.append('green')
            bg_31_60.append('red')
            bg_61_90.append('orange')
            bg_91_infinity.append('blue')
            data_0_30.append(order_0_30)
            data_31_60.append(order_31_60)
            data_61_90.append(order_61_90)
            data_91_infinity.append(order_91_infinity)
        chart_data = {
            "labels": labels,
            "datasets": [
                {
                    "label": "0 to 30",
                    "backgroundColor": bg_0_30,
                    "data": data_0_30
                },
                {
                    "label": "31 to 60",
                    "backgroundColor": bg_31_60,
                    "data": data_31_60
                },
                {
                    "label": "61 to 90",
                    "backgroundColor": bg_61_90,
                    "data": data_61_90
                },
                {
                    "label": ">90",
                    "backgroundColor": bg_91_infinity,
                    "data": data_91_infinity
                }
            ]
        }
        return json.dumps(chart_data)
    
    
    @http.route('/wip_detail', auth="user", type="json")
    def wip_detail(self, **data):
        print('*'*100, data)
        maintenance_request_domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data) 
        if 'searchInput' in data and data['searchInput']:
           maintenance_request_domain.append(('name','=', data['searchInput'])) 
        elif 'searchInput' in data  and ('name', '=', data['searchInput']) in maintenance_request_domain:
            maintenance_request_domain.remove(('name', '=', data['searchInput']))
        page = 1
        if 'page' in data:
          page = data['page']
        per_page_records = 20
        offset = (page-1)*per_page_records + 1
        record_start_at =  1
        is_first_page = True
        if offset>1:
            record_start_at = offset
            is_first_page = False
        record_end_at = offset+per_page_records - 1
        total_record = request.env['maintenance.request'].search_count(maintenance_request_domain)
        
        is_last_page = False
        if record_end_at >= total_record:
           record_end_at = total_record
           is_last_page = True
        
        pager = {
            'recordStartAt': record_start_at,
            'recordEndAt': record_end_at,
            'totalRecord': total_record,
            'isFirstPage': is_first_page,
            'isLastPage': is_last_page
        }
        
        # maintenance_requests = request.env['maintenance.request'].search(maintenance_request_domain, limit=per_page_records,offset=offset)
        maintenance_requests = request.env['maintenance.request'].search(maintenance_request_domain)
        wip_detail_data = []
        for maintenance_request in maintenance_requests:
            last_labour_date = '-'
            invoice_date = '-'
            if maintenance_request.last_labor_date:
               last_labour_date = request.env['cummin_dashboard.helper'].formatted_date(maintenance_request.last_labor_date)
            if maintenance_request.invoice_date:
               last_labour_date = request.env['cummin_dashboard.helper'].formatted_date(maintenance_request.invoice_date)
            age= request.env['cummin_dashboard.helper'].calculate_age_in_day(maintenance_request.request_date)
            if not request.env['cummin_dashboard.helper'].between_x1_x2_age(age,data['ageStartAt'],data['ageEndAt']): 
                print('*'*100, 'Continuing..')
                continue

            wip_detail_data.append({
               'key': maintenance_request.id,
               'age': age,
               'order_status': maintenance_request.order_status,
               'name': maintenance_request.name,
               'country': maintenance_request.country,
               'branch': maintenance_request.branch,
               'invoice_no': maintenance_request.invoice,
               'last_labour_date':last_labour_date ,
               'customer_name': maintenance_request.customer,
               'currency': maintenance_request.currency,
            #    'currency_rate': maintenance_request.currency_rate.rate,
               'billed_hours': maintenance_request.billed_hours,
               'labour_sales': maintenance_request.labour_sales,
               'other_sales': maintenance_request.labour_sales,
               'distributor': maintenance_request.distributor,
               'order_type': maintenance_request.order_type,
               'serial': maintenance_request.serial,
               'invoice_date': invoice_date,
               'wip_cost': maintenance_request.wip_cost,
               'parts_sales': maintenance_request.parts_sales,
               'bill_type': maintenance_request.bill_type,
               'service_model': maintenance_request.service_model,
            })
        # return wip_detail_data
        return json.dumps({'pager': pager, 'data':wip_detail_data})

    @http.route('/test_url', auth="public", type="http", website="true")
    def test_url(self, **data):
        return request.render('cummin_dashboard.test_page', {'message':'Hey Gerald. How are you?'})