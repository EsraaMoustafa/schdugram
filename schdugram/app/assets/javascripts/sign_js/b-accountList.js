(function ($) {
    $.fn.scrollView = function () {
        return this.each(function () {
            $('html, body').animate({
                scrollTop: $(this).offset().top - 80
            }, 1000);
        });
    };
    $.widget('role.b-accountList', {

        options: {
            url: ''
        },

        _create: function () {
            this.$list = this._elem('list');
            this.$addBlock = this._elem('addBlock');
            this.$popup = this._elem('popup');
            this.$changeUsernamePopup = this._elem('changeUsernamePopup');
            this.$deletePopup = this._elem('deletePopup');
            this.$retryPopup = this._elem('retryPopup');
            this.$settingsPopup = this._elem('settingsPopup');
            var submitUsername = this._elem('modalChangeUsername');
            var changeSettings = this._elem('modalSettings');
            var submit = this._elem('modalresetPassword');
            var deleteAccount = this._elem('modalDeleteAccount');
            var retryAccount = this._elem('modalRetryAccount');
            this._elem('modalresetPassword').click(this._proxy(function () {
                var password = this._elem('newPassword').val();
                var data = {
                    password: password,
                    id: this._elem('modalId').val()
                };
                var _this = this;
                submit.button('loading');
                $.post(this.options.changePasswordUrl, data)
                    .always(function (res) {
                        submit.button('reset');
                        if (res.status == 'ok') {
                        	_this._delMod('error');
                            _this._setMod('success');
                            _this._elem('successMessage').text(res.data);
                            $('#accountList').scrollView();
                        } else {
                        	_this._delMod('success');
                        	_this._setMod('error');
                            if (typeof res.message == 'string') {
                                _this._elem('errorMessage').text(res.message );
                                _this._elem('errorMessage' ).scrollView();
                            } else {
                                for (var key in res.message) {
                                    _this._elem('errorMessage').text(res.message[key] );
                                }
                                _this._elem('errorMessage' ).scrollView();
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$popup.modal('hide');
                    }))
                    .done();
            }));

            this._elem('modalChangeUsername').click(this._proxy(function () {
                var username = this._elem('newUsername').val(),
                    id = this._elem('username').val();

                var data = {
                    username: username,
                    id: id
                };
                var _this = this;
                submitUsername.button('loading');
                $.post(this.options.changeUsernameUrl, data)
                    .always(function (res) {
                        submitUsername.button('reset');
                        if (res.status == 'ok') {
                            _this._delMod('error');
                            _this._setMod('success');
                            $("#acc-username-"+id).text(username);
                            _this._elem('successMessage').text(res.data);
                        } else {
                            _this._delMod('success');
                            _this._setMod('error');
                            if (typeof res.message == 'string') {
                                _this._elem('errorMessage').text(res.message);
                            } else {
                                for (var key in res.message) {
                                    _this._elem('errorMessage').text(res.message[key]);
                                }
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$changeUsernamePopup.modal('hide');
                    }))
                    .done();
            }));

            this._elem('modalSettings').click(this._proxy(function () {
                var setting = this._elem('retryOption').filter(':checked').val(),
                    id = this._elem('settingsModalId').val();

                var data = {
                    setting: setting,
                    id: id
                };
                var _this = this;
                changeSettings.button('loading');
                $.post(this.options.changeSettingsUrl, data)
                    .always(function (res) {
                        changeSettings.button('reset');
                        if (res.status == 'ok') {
                            _this._delMod('error');
                            _this._setMod('success');
                            _this._elem('successMessage').text(res.data);
                            _this._reload();
                        } else {
                            _this._delMod('success');
                            _this._setMod('error');
                            if (typeof res.message == 'string') {
                                _this._elem('errorMessage').text(res.message);
                            } else {
                                for (var key in res.message) {
                                    _this._elem('errorMessage').text(res.message[key]);
                                }
                            }
                        }
                    })
                    .always(this._proxy(function () {
                        this.$settingsPopup.modal('hide');
                    }))
                    .done();
            }));

            this._elem('modalDeleteAccount').click(this._proxy(function () {
                this._removeItem(this._elem('deleteModalId').val());
            }));

            this._elem('modalRetryAccount').click(this._proxy(function () {
                this._retryItem(this._elem('retryModalId').val());
            }));

            this._elem('addButton').click(this._proxy(function () {
                this._setMod(this.$addBlock, 'open');
            }));

            this._elem('cancelButton').click(this._proxy(function () {
                this._delMod(this.$addBlock, 'open');
            }));

            this.element.on('click', '.' + this._getElemClass('removeButton'), this._proxy(function (e) {
                var target = this._elem('item').has($(e.currentTarget));
                this._showPopupDelete(target.data('id'), target.data('username'))
            }));

            this.element.on('click', '.' + this._getElemClass('retryButton'), this._proxy(function (e) {
                var target = this._elem('item').has($(e.currentTarget));
                this._showRetryPopup(target.data('id'), target.data('username'))
            }));

            this.element.on('click', '.' + this._getElemClass('settingsButton'), this._proxy(function (e) {
                var target = this._elem('item').has($(e.currentTarget));
                this._showSettingsPopup(target.data('id'), target.data('username'), target.data('settings'))
            }));

            this.element.on('b-ajaxform:success', this._proxy(function () {
                this.element.find('form')['b-ajaxForm']('reset');
                this._reload();
            }));

            this._reload();

            this.element.on('click', '.' + this._getElemClass('item'), this._proxy(function (e) {
                var target = $(e.currentTarget);
                e.preventDefault();

                target.toggleClass('active');
            }));

            this.element.on('click', '.' + this._getElemClass('changeUsername'), this._proxy(function (e) {
                console.log("change username clicked");
                var target = this._elem('item').has($(e.currentTarget));
                this._showPopupUsername(target.data('id'));
            }));

            this.element.on('click', '.' + this._getElemClass('changePassword'), this._proxy(function (e) {
                console.log("change password clicked");
                var target = this._elem('item').has($(e.currentTarget));
                this._showPopupEdit(target.data('id'));
            }));
        },
        _disableButton: function (elem) {
        //this._elem("submitButton").button('Processing...');
        this._elem(elem).attr("disabled", "disabled");
        },
        _enableButton: function (elem) {
            //this._elem("submitButton").button('reset');
            this._elem(elem).prop("disabled", false);
        },

        _reload: function () {
            var _this = this;
            _this.$list.html('<p>Loading...</p>');
            $.get(this.options.url)
                .then(function (resp) {
                    _this.$list.html(resp.data);
                })
                .done();
        },
        _retryItem: function(id){
            var _this = this;
            _this._disableButton("modalRetryAccount");
            $.post(this.options.retryUrl, {id: id})
                .then(function () {
                    _this._reload();
                    _this.$retryPopup.modal('hide');
                    _this._enableButton("modalRetryAccount");
                })
                .done();
        },
        _removeItem: function (id) {
            var _this = this;
            _this._disableButton("modalDeleteAccount");
            $.post(this.options.removeUrl, {id: id})
                .then(function () {
                    _this._reload();
                    _this.$deletePopup.modal('hide');
                    _this._enableButton("modalDeleteAccount");
                })
                .done();
        },

        _changeSettings: function (id) {
            var _this = this;
            _this._disableButton("modalDeleteAccount");
            $.post(this.options.changeSettingsUrl, {id: id})
                .then(function () {
                    _this._reload();
                    _this.$deletePopup.modal('hide');
                    _this._enableButton("modalDeleteAccount");
                })
                .done();
        },

        _getItems: function () {
            return this._elem('item');
        },

        getActiveIds: function () {
            var ids = [];
            this._elem('item').filter('.active').each(function () {
                ids.push($(this).data('id'));
            });

            return ids;
        },

        _showPopupUsername: function (id) {
            console.log(id);
            this._elem('username').val(id);
            this.$changeUsernamePopup.modal('show');
        },

        _showPopupEdit: function (id) {
            this._elem('modalId').val(id);
            this.$popup.modal('show');
        },

        _showPopupDelete: function (id, user) {
          this._elem('deleteModalId').val(id);
          this._elem('deleteModalUsername').html('Are you sure you want to delete '+ user + ' ?');
          this.$deletePopup.modal('show');
      },
        _showRetryPopup: function(id,user){
            this._elem('retryModalId').val(id);
            this._elem('retryModalUsername').html('Do you want to retry '+ user + ' ?');
            this.$retryPopup.modal('show');
        },
        _showSettingsPopup: function(id,user, settings){
            this._elem('settingsModalId').val(id);
            this._elem('settingsModalUsername').html(user);
            this._elem('retryOption').filter('[value="'+settings+'"]').prop("checked",true);
            this.$settingsPopup.modal('show');
        }

    });

})(jQuery);
