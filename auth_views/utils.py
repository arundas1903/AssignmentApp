def update_meta_data(**kwargs):
    try:
        user = kwargs['user']
        print(user)
        meta_data = user.meta if user.meta else {}
        meta_data[kwargs['backend'].name] = kwargs['response']
        user.meta = meta_data
        user.save()
    except Exception as e:
        print(e)
    return kwargs