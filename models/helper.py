from odoo import fields, models

class Helper(models.AbstractModel):
    _name = 'cummin_dashboard.helper'


    def calculate_percentage(self, numerator,denominator):
        if numerator == 0 and denominator == 0:
            return 0
        if denominator == 0:
            return 'Inifinity'
        return round(numerator/denominator,2)