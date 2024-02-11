{
    'name': 'Cummin Dashboard',
    'author': 'Abdus Sattar Bhuiyan',
    'sequence': -100,
    'category': 'An intuitive dashboard with OWL JS',
    'version': '1.0.0',
    'depends': [],
    'license': 'LGPL-3',
    'data': [
         'views/dashboard_view.xml',
         'views/wo_aging_view.xml',
         'views/templates.xml',
         'security/user_group.xml'
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'assets': {
        'web.assets_backend': [
            '/cummin_dashboard/static/src/components/**/*.js',
            '/cummin_dashboard/static/src/components/**/*.xml',
            '/cummin_dashboard/static/src/components/**/*.scss',
            '/cummin_dashboard/static/src/lib/daterange/daterange.css',
            '/cummin_dashboard/static/src/lib/daterange/brand.css',
        ],
        'web.assets_frontend': [
            '/cummin_dashboard/static/src/lib/daterange/brand.css',
        ]
    }
}