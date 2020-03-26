from django import forms

class SetPhoneNumber(forms.Form):
    phone_number = forms.CharField(label='Phone number', max_length=13, required=True)
