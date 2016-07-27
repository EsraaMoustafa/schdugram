(function ($) {

    $.widget('role.b-signin', {

    	_getParam: function(name){
    		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    	    results = regex.exec(location.search);
    	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    	},

        _create: function () {
            this.$popup = this._elem('popup');
            this.$resetpopup = this._elem('resetpopup');
            var submit = this._elem('modalSubmitPassword');
            var usernameSubmit = this._elem('modalSubmitUsername');
            var resetPassword = this._elem('modalresetPassword');
            this.$submitButton = this._elem('signinButton');
            this.$button = this._elem('button');
            this._elem('modalSubmitPassword').click(this._proxy(function () {
                var email = this._elem('email').val();
                var data = {
                    email: email
                };
                var _this = this;
                submit.button('loading');
                $.post(this.options.forgotPasswordUrl, data)
                    .always(function (res) {
                        if (res.status == 'ok') {
                            _this._showSuccess(res.data);
                        } else {
                            if (typeof res.message == 'string') {
                                _this._showError(res.message);
                            } else {
                                for (var key in res.message) {
                                    _this._showError(res.message[key]);
                                }
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$popup.modal('hide');
                    })).fail(function(){
                        _this._showError("System error. Please email us at support@schedugr.am and we will assist.");
                    })
                    .done;
            }));

            this._elem('modalSubmitUsername').click(this._proxy(function () {
                var email = this._elem('email').val();
                var data = {
                    email: email
                };
                var _this = this;
                usernameSubmit.button('loading');
                $.post(this.options.forgotUsernameUrl, data)
                    .always(function (res) {
                    	usernameSubmit.button('reset');
                        if (res.status == 'ok') {
                            _this._showSuccess(res.data);
                        } else {
                            if (typeof res.message == 'string') {
                                _this._showError(res.message);
                            } else {
                                for (var key in res.message) {
                                    _this._showError(res.message[key]);
                                }
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$popup.modal('hide');
                    })).fail(function(){
                        _this._showError("System error. Please email us at support@schedugr.am and we will assist.");
                    })
                    .done;
            }));

            this._elem('modalresetPassword').click(this._proxy(function () {
                var password = this._elem('newPassword').val();
                var repeatPassword = this._elem('repeatNewPassword').val();
                var token = this._getParam('token');
                var data = {
                    newPassword: password,
                    repeatNewPassword: repeatPassword,
                    token: token
                };
                var _this = this;
                resetPassword.button('loading');
                $.post(this.options.resetPasswordUrl, data)
                    .always(function (res) {
                        if (res.status == 'ok') {
                            _this._showSuccess(res.data);
                        } else {
                            if (typeof res.message == 'string') {
                                _this._showError(res.message);
                            } else {
                                for (var key in res.message) {
                                    _this._showError(res.message[key]);
                                }
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$resetpopup.modal('hide');
                    })).fail(function(){
                        _this._showError("System error. Please email us at support@schedugr.am and we will assist.");
                    })
                    .done;
            }));

            this._elem('item').click(this._proxy(function (e) {
                var target = $(e.currentTarget);
                this._setActive(this._getMod(target, 'type'));
                e.preventDefault()
            })).first().click();


            this.element.on('click', '.' + this._getElemClass('forgotButton'), this._proxy(function (e) {
                var target = this._elem('i').has($(e.currentTarget));
                this._showPopup()
            }));
        },

        _showPopup: function () {
            this.$popup.modal('show');
        },
        _disableUpload: function (dis) {
            this.$submitButton.attr('disabled', dis);
            this.$button.attr('disabled', dis);
        },
        _showError: function(error){
            $('#errorMessage').show().text(error);
        },
        _showSuccess: function(success){
            $('#successMessage').show().text(success);
        }

    });

})(jQuery);
