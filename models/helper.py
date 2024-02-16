from odoo import fields, models

class Helper(models.AbstractModel): 
    _name = 'cummin_dashboard.helper'


    def calculate_percentage(self, numerator,denominator):
        if numerator == 0 and denominator == 0:
            return 0
        if denominator == 0:
            return 'Inifinity'
        return round(numerator/denominator,2)
    
   
    def get_filtering_domain(self,data):
        domain = []
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
               domain.append(('create_uid', 'in', user_ids))

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
        return domain,time_sheet_domain
            