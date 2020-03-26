from django import forms

class SetPasswordForm(forms.Form):
    password = forms.CharField(label='Password', max_length=100, widget=forms.PasswordInput)
    confirm_password = forms.CharField(label='Confirm Password', max_length=100, widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super(SetPasswordForm, self).clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password != confirm_password:
            raise forms.ValidationError(
                "password and confirm_password does not match"
            )


class SearchForm(forms.Form):
    phone = forms.CharField(label='Search phone number', max_length=100)
