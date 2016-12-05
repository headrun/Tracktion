from __future__ import unicode_literals

from django.db import models

class Enrollment(models.Model):
    emp_id = models.IntegerField()
    enroll_start = models.DateField()
    enroll_end = models.DateField()
    status = models.CharField(max_length=10)
    mem_id = models.IntegerField()
    mem_fname = models.CharField(max_length=50, null=False, blank=True)
    mem_lname = models.CharField(max_length=50, null=False, blank=True)
    mem_gender = models.CharField(max_length=1)
    mem_dob = models.DateField()
    mem_adr_line1 = models.CharField(max_length=50, null=False, blank=True)
    mem_adr_line2 = models.CharField(max_length=50, null=False, blank=True)
    mem_adr_city = models.CharField(max_length=50, null=False, blank=True)
    mem_adr_state = models.CharField(max_length=50, null=False, blank=True)
    mem_adr_zip = models.CharField(max_length=10, null=False, blank=True)
    phone_number = models.CharField(max_length=20, null=False, blank=True)
    email = models.CharField(max_length=50, null=False, blank=True)
    emp_self = models.CharField(max_length=10, null=False, blank=True)
    health_plan = models.CharField(max_length=10, null=False, blank=True)
    annual_hra_funding_amount = models.IntegerField(default=0)
    account_type_code = models.CharField(max_length=10, null=False, blank=True)
    account_contribution = models.IntegerField(default=0)
    employer_contribution_to_fsa = models.IntegerField(default=0)
    pre_existing_illness = models.CharField(max_length=3, null=False, blank=True)
    disease1 = models.CharField(max_length=30, null=False, blank=True)
    disease2 = models.CharField(max_length=30, null=False, blank=True)
    disease3 = models.CharField(max_length=30, null=False, blank=True)
    disease4 = models.CharField(max_length=30, null=False, blank=True)
    disease5 = models.CharField(max_length=30, null=False, blank=True)
    height = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    weight = models.IntegerField(default=0)
    bmi = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    smoking = models.CharField(max_length=1, null=False, blank=True)
    drinking = models.CharField(max_length=1, null=False, blank=True)
    hdl = models.CharField(max_length=1, null=False, blank=True)
    ldl = models.CharField(max_length=1, null=False, blank=True)
    bp = models.CharField(max_length=1, null=False, blank=True)
    triglycerides = models.CharField(max_length=1, null=False, blank=True)
    income = models.IntegerField(default=0)
    age = models.IntegerField(default=0)

class EnrollmentSummary(models.Model):
    location = models.CharField(max_length=10)
    gender = models.CharField(max_length=1)
    year = models.CharField(max_length=4)
    plan = models.CharField(max_length=10)
    age_group = models.CharField(max_length=10)
    income_group = models.CharField(max_length=10)
    total = models.IntegerField()
    emp_total = models.IntegerField()

    class Meta:
        unique_together = (('location', 'gender', 'year', 'plan', 'age_group', 'income_group'),)

class Claim(models.Model):
    grp = models.CharField(max_length=10, null=False, blank=True)
    cert_num = models.CharField(max_length=20, null=False, blank=True)
    seq = models.IntegerField(default=0)
    cid = models.CharField(max_length=20, null=False, blank=True)
    l_name = models.CharField(max_length=20, null=False, blank=True)
    m_name = models.CharField(max_length=20, null=False, blank=True)
    f_name = models.CharField(max_length=20, null=False, blank=True)
    addr1 = models.CharField(max_length=230, null=False, blank=True)
    addr2 = models.CharField(max_length=230, null=False, blank=True)
    city = models.CharField(max_length=20, null=False, blank=True)
    state = models.CharField(max_length=20, null=False, blank=True)
    zip = models.CharField(max_length=20, null=False, blank=True)
    plan_mm = models.CharField(max_length=20, null=False, blank=True)
    status = models.CharField(max_length=2, null=False, blank=True)
    dep_status_mm = models.CharField(max_length=20, null=False, blank=True)
    mem_f_name = models.CharField(max_length=20, null=False, blank=True)
    mem_l_name = models.CharField(max_length=20, null=False, blank=True)
    mem_dob = models.DateField()
    mem_sex = models.CharField(max_length=1, null=False, blank=True)
    rel = models.CharField(max_length=2, null=False, blank=True)
    prov_1_key = models.CharField(max_length=15, null=False, blank=True)
    prov_1_tin = models.CharField(max_length=15, null=False, blank=True)
    office_name = models.CharField(max_length=230, null=False, blank=True)
    provaddr1 = models.CharField(max_length=230, null=False, blank=True)
    provaddr2 = models.CharField(max_length=230, null=False, blank=True)
    provcity = models.CharField(max_length=50, null=False, blank=True)
    provstate = models.CharField(max_length=20, null=False, blank=True)
    provzip = models.CharField(max_length=20, null=False, blank=True)
    spec1 = models.CharField(max_length=5, null=False, blank=True)
    drg = models.CharField(max_length=20, null=False, blank=True)
    rev_code = models.CharField(max_length=20, null=False, blank=True)
    dx_1 = models.CharField(max_length=20, null=False, blank=True)
    dx_2 = models.CharField(max_length=20, null=False, blank=True)
    dx_3 = models.CharField(max_length=20, null=False, blank=True)
    dx_4 = models.CharField(max_length=20, null=False, blank=True)
    px_code = models.CharField(max_length=20, null=False, blank=True)
    amt_charge = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    amt_paid_to_prov = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    amt_disallowed = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    amt_copay = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    amt_deduct = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    clm_status = models.CharField(max_length=5, null=False, blank=True)
    paid_date = models.DateField()
    svc_from = models.DateField()
    svc_to = models.DateField()
    admit_date = models.DateField(null=True, blank=True)
    cob_amt_emp = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    cob_amt_prov = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    coins = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    amt_allowed = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    units = models.CharField(max_length=10, null=False, blank=True)
    mod_1 = models.CharField(max_length=5, null=False, blank=True)
    mod_2 = models.CharField(max_length=5, null=False, blank=True)
    mod_3 = models.CharField(max_length=5, null=False, blank=True)
    cpt4 = models.CharField(max_length=230, null=False, blank=True)
    net_1 = models.CharField(max_length=10, null=False, blank=True)
    inelig_reason_code = models.CharField(max_length=5, null=False, blank=True)
    amt_paid_to_pt = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    npi = models.CharField(max_length=20, null=False, blank=True)
    disease_category = models.CharField(max_length=100, null=False, blank=True)
    member = models.ForeignKey(Enrollment, null=True, blank=True, default = None)

class ClaimsSummary(models.Model):
    location = models.CharField(max_length=10)
    disease = models.CharField(max_length=100)
    month = models.CharField(max_length=4)
    procedure = models.CharField(max_length=100)
    plan = models.CharField(max_length=10)
    age_group = models.CharField(max_length=10)
    total = models.IntegerField()
    patients = models.IntegerField()
    total_amount = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    insuer = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    pocket = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    smoker = models.IntegerField()
    non_smoker = models.IntegerField()
    obese = models.IntegerField()
    fit = models.IntegerField()
    healthy = models.IntegerField()
    unhealthy = models.IntegerField()
    cut_off = models.IntegerField()

    class Meta:
        unique_together = (('location', 'disease', 'procedure', 'plan', 'month', 'age_group'),)

class ClaimsProvSummary(models.Model):
    month = models.CharField(max_length=4)
    plan = models.CharField(max_length=10)
    location = models.CharField(max_length=10)
    disease = models.CharField(max_length=100)
    procedure = models.CharField(max_length=100)
    data = models.TextField()

    class Meta:
        unique_together = (('location', 'plan', 'month', 'disease', 'procedure'),)

class ClaimsAll(models.Model):
    month = models.IntegerField()
    plan = models.CharField(max_length=10)
    location = models.CharField(max_length=10)
    data = models.TextField()

    class Meta:
        unique_together = (('location', 'plan', 'month'),)

class EnrollClaimSummary(models.Model):
    plan = models.CharField(max_length=10)
    location = models.CharField(max_length=10)
    gender = models.CharField(max_length=10)
    age_group = models.CharField(max_length=10)
    total = models.IntegerField()
    emp_total = models.IntegerField()

    class Meta:
        unique_together = (('location', 'plan', 'gender', 'age_group'),)

class InpatientCostDriver(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=255)
    claims = models.TextField()
    facilities = models.TextField()
    claims_service = models.TextField()
    claims_cost_service = models.TextField()

class InpatientVisitTrend(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=255)
    trends = models.TextField()
    trends_type = models.TextField()
    cost = models.TextField()

class InpatientStayAnalysis(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=10)
    total = models.TextField()
    avg = models.TextField()

class InpatientReadmissions(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=10)
    analysis = models.TextField()

class OutpatientCostDriver(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=255)
    claims = models.TextField()
    facilities = models.TextField()
    claims_service = models.TextField()
    claims_cost_service = models.TextField()

class OutpatientVisitTrend(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=255)
    trends = models.TextField()
    trends_type = models.TextField()
    cost = models.TextField()


class FinancialCostAnalysis(models.Model):
    plan = models.CharField(max_length=10)
    location = models.CharField(max_length=10)
    customer_segment = models.CharField(max_length=10)
    year = models.CharField(max_length=10)
    avg_cost = models.TextField()
    tot_cost = models.TextField()
    sub_category = models.TextField()
    plan_cost = models.TextField()

class FinancialOnsiteClinicImpact(models.Model):
    customer_segment = models.CharField(max_length=10)
    onsite_clinic = models.TextField()
    impact_on_health = models.TextField()
    onsite_clinic_attendees = models.TextField()
    visiting_specialities = models.TextField()

class HealthInitiative(models.Model):
    location = models.CharField(max_length=10)
    year = models.CharField(max_length=10)
    programs = models.TextField()
    attendees = models.TextField()
    completion_rate = models.TextField()

class Dental(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claims = models.TextField()
    claims_member = models.TextField()

class Vision(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claims = models.TextField()
    claims_member = models.TextField()

class ClaimsCostAnalysis(models.Model):
    location = models.CharField(max_length=10)
    year = models.CharField(max_length=10)
    claims = models.TextField()
    cost = models.TextField()
    cov_othercost = models.TextField()

class CovIdentifier(models.Model):
    location = models.CharField(max_length=30)
    disease = models.CharField(max_length=100)
    procedure = models.CharField(max_length=100)
    providers = models.TextField()

class FinancialClaimCostAnalysis(models.Model):
    plan = models.CharField(max_length=10)
    location = models.CharField(max_length=10)
    quarter = models.CharField(max_length=10)
    total_amount = models.DecimalField(max_digits=11, decimal_places=2, default='0.00', null=False, blank=True)
    emp_total = models.IntegerField()
    mem_total = models.IntegerField()
    sub_category = models.TextField()
    plan_cost = models.TextField()

    class Meta:
        unique_together = (('location', 'plan', 'quarter'),)

class StayAnalysis(models.Model):
    population = models.CharField(max_length=10)
    geography = models.CharField(max_length=10)
    plan = models.CharField(max_length=10)
    claimsdriver = models.CharField(max_length=255)
    quarter = models.CharField(max_length=10)
    total = models.IntegerField()
    days = models.IntegerField()

    class Meta:
        unique_together = (('population', 'plan', 'quarter', 'geography', 'claimsdriver'),)

class ClaimsProviderSummary(models.Model):
    location = models.CharField(max_length=10)
    disease = models.CharField(max_length=100)
    procedure = models.CharField(max_length=100)
    data = models.TextField()

    class Meta:
        unique_together = (('location', 'disease', 'procedure'),)

class ClaimsProvidersSummary(models.Model):
    location = models.CharField(max_length=10)
    disease = models.CharField(max_length=100)
    procedure = models.CharField(max_length=100)
    data = models.TextField()
    total = models.IntegerField(default=0)

    class Meta:
        unique_together = (('location', 'disease', 'procedure'),)
