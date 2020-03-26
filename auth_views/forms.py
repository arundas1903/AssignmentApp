from django import forms

class SetPhoneNumber(forms.Form):
    phone_number = forms.CharField(label='Phone number', max_length=13, required=True)


class LoginForm(forms.Form):
    phone_number = forms.CharField(label='Phone number', max_length=13, required=True)
    password = forms.CharField(label='Password', max_length=100, widget=forms.PasswordInput)
