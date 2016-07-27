
(function ($) {
    var thisPage;
    $.fn.scrollView = function () {
        return this.each(function () {
            $('html, body').animate({
                scrollTop: $(this).offset().top - 80
            }, 1000);
        });
    };

    $.widget('role.b-schedule', {

        _create: function () {
            this.$popup = this._elem('popup');
            this.$cancelPopup = this._elem('cancelPopup');
            this.$removePopup = this._elem('removePopup');

            var submit = this._elem('modalSubmit');
            this._elem('modalSubmit').click(this._proxy(function () {
                console.log('1');
                if(timeDatePickerPref=='new'){
                    var time = this._elem('timepicker').val();
                    var date = this._elem('datepicker').val();
                    var jsdate = this._elem('datepicker').mobiscroll('getDate');
                } else {
                    time = this._elem('timepicker').data('timepicker').getTime();
                    date = this._elem('datepicker').val();
                    jsdate = this._elem('datepicker').datepicker('getDate');
                }
                    var datestring=date.substr(0,3)+(jsdate.getMonth()+1)+date.substr(6,5),
                    date2=moment(datestring,"DD-M-YYYY" );
                if(timePreference =='24h'){
                    var m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
                }else {
                    m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A').format('YYYY-MM-DD HH:mm');
                }

                var data = {
                    date: m,
                    repost: this._elem('repost').val(),
                    id: this._elem('modalId').val(),
                    caption : this._elem( 'caption' ).val(),
                    firstcomment : this._elem( 'firstcomment' ).val()
                };
                var _this = this;
                submit.button('loading');
                $.post(this.options.setDateUrl, data)
                    .always(function (res) {
                        submit.button('reset');
                        if (res.status == 'ok') {
                        	_this._delMod('error');
                            _this._setMod('success');
                        } else {
                            console.log(res);
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
                        this.$popup.modal('hide');
                        this._loadCurrent();
                    }))
                    .done;
            }));

            this._elem('modalCancel').click(this._proxy(function () {
              this._cancelRequest(this._elem('cancelModalId').val());
            }));

            this._elem('modalRemove').click(this._proxy(function () {
              this._removeRequest(this._elem('removeModalId').val());
            }));

            var submit = this._elem('modalSubmitNow');
            this._elem('modalSubmitNow').click(this._proxy(function () {
                var date = new Date(Date.now()+30*1000);
                var data = {
                    date: date,
                    repost: this._elem('repost').val(),
                    id: this._elem('modalId').val(),
                    caption : this._elem( 'caption' ).val(),
                    firstcomment : this._elem( 'firstcomment' ).val()
                };
                var _this = this;
                submit.button('loading');
                $.post(this.options.setDateUrl, data)
                    .always(function (res) {
                        submit.button('reset');
                        if (res.status == 'ok') {
                        	_this._delMod('error');
                            _this._setMod('success');
                        } else {
                        	_this._delMod('success');
                        	_this._setMod('error');
                            if (typeof res.message == 'string') {
                                _this._elem('errorMessage').text(res.message);
//                                _this._elem('errorMessage' ).scrollView();
                            } else {
                                for (var key in res.message) {
                                    _this._elem('errorMessage').text(res.message[key]);
//                                    _this._elem('errorMessage' ).scrollView();
                                }
                            }
                        }
                    })
                    .then(this._proxy(function () {
                        this.$popup.modal('hide');
                        this._loadCurrent();
                    }))
                    .done;
            }));
            if(timeDatePickerPref === 'new'){
                this._elem('datepicker').mobiscroll().calendar({
                    theme: 'mobiscroll',
                    display: 'bubble',
                    minDate: new Date(),
                    dateFormat: 'dd-M-yy',
                    closeOnSelect:true
                });
                if(timePreference=='24h'){
                    var format = 'HH:ii';
                    var timeWheels = 'HHii';
                }else{
                    format = 'hh:ii A';
                    timeWheels = 'hhiiA';
                }
                this._elem('timepicker').mobiscroll().time({
                    theme: 'mobiscroll',
                    display: 'bubble',
                    headerText: false,
                    timeFormat: format,
                    timeWheels: timeWheels,
                    steps:{minute:5,zeroBased:true}
                });
            }else{
                if(timePreference == '24h'){
                    var meridian = false;
                }else{
                    meridian = true;
                }
                this._elem('timepicker').timepicker({
                    minuteStep: 5,
                    showMeridian: meridian,
                    disableMousewheel:true
                });
                this._elem('datepicker').datepicker({
                    autoclose: true,
                    todayHighlight: true,
                    format: "dd-M-yyyy"
                });
            }

            this._elem('item').click(this._proxy(function (e) {
                var target = $(e.currentTarget);
                this._setActive(this._getMod(target, 'type'));
                e.preventDefault()
            })).first().click();

          this.element.on('click', '.' + this._getElemClass('next'), this._proxy(function (e) {
            this._loadNext();
          }));

          this.element.on('click', '.' + this._getElemClass('previous'), this._proxy(function (e) {
            this._loadPrevious();
          }));

            this.element.on('click', '.' + this._getElemClass('cancelButton'), this._proxy(function (e) {
              var target = this._elem('i').has($(e.currentTarget));
              this._showPopupCancel(target.data('id'))
            }));

            this.element.on('click', '.' + this._getElemClass('removeButton'), this._proxy(function (e) {
              var target = this._elem('i').has($(e.currentTarget));
              this._showPopupRemove(target.data('id'))
            }));

            this.element.on('click', '.' + this._getElemClass('editButton'), this._proxy(function (e) {
                var target = this._elem('i').has($(e.currentTarget));
                this._showPopupEdit(target.data('date'), target.data('id'), target.data('caption'),target.data('firstcomment'))
            }));

            this.element.on('click', '.' + this._getElemClass('repeatButton'), this._proxy(function (e) {
                var target = this._elem('i').has($(e.currentTarget));
                this._showPopupRepeat(target.data('date'),target.data('id'), target.data('caption'),target.data('firstcomment'))
            }));
        },

        _setActive: function (type) {
            var $list = this._elem('list', type);

            this._setMod('type', type);
            this._elem('item').parent().removeClass('active');
            this._elem('item', 'type', type).parent().addClass('active');
            thisPage=0;
            this._load($list.data('url'), $list, 0);
        },

        _load: function (url, where, skip) {
            where.html('<p>Loading...</p>');
            $.get(url + '?skip=' + skip)
                .then(function (res) {
                    where.html(res.data);
                    where.find('.footable').footable();
                    where.find('.table').filterable({
                        editableSelector: 'i[class="fa fa-filter"]' ,
                        onlyColumns:[2]
                    });
                    $("img").unveil(200);
                })
                .done();

        },

        _loadCurrent: function () {
            console.log(this._elem('currentPage').val());
            var type = this._getMod('type'),
                list = this._elem('list', type);
            var currentPage = (this._elem('currentPage') && this._elem('currentPage').val()) ? this._elem('currentPage').val() : 0;
            console.log('Current');
            console.log(currentPage-1);
            this._load(list.data('url'), list, currentPage-1);
        },

        _loadNext: function () {
            thisPage++;
          var type = this._getMod('type'),
          list = this._elem('list', type);
          var currentPage = thisPage ? thisPage : 0;
            if(currentPage <0){currentPage=0}
          this._load(list.data('url'), list, currentPage);
        },

        _loadPrevious: function () {
            thisPage=thisPage-1;
          var type = this._getMod('type'),
          list = this._elem('list', type);
            var currentPage = thisPage ? thisPage : 0;
            if(currentPage <0){currentPage=0}
          this._load(list.data('url'), list, currentPage);
        },

        _cancelRequest: function (id) {
            $.post(this.options.cancelUrl, {id: id})
                .always(this._proxy(function () {
                    this._loadCurrent();
                    this.$cancelPopup.modal('hide');
                }))
                .done();
        },

        _removeRequest: function (id) {
            $.post(this.options.removeUrl, {id: id})
                .always(this._proxy(function () {
                    this._loadCurrent();
                    this.$removePopup.modal('hide');
                }))
                .done();
        },

        _showPopupEdit : function (d, id, caption, firstcomment) {
            var date = new Date(Date.parse(d));
            var mom = moment(date);
            mom.hour(0);
            mom.minute(0);
            mom.second(0);
            var thedate = moment.utc(mom.format('YYYY-MM-DD HH:mm'), 'X');
            var thedate2 = mom.toDate();
            this._elem('modalId').val(id);
            this._elem('caption').val(caption);
            this._elem( 'firstcomment' ).val( firstcomment );
            if(timeDatePickerPref === 'new'){
                this._elem('timepicker').mobiscroll('setVal',date,true);
                this._elem('datepicker').mobiscroll('setVal',thedate2,true);
            }else{
                this._elem('timepicker').timepicker('setTime', date);
                this._elem('datepicker').datepicker('setDate', thedate2);
            }
            this._elem('repost').val(false);
            $(".emojii_keyboard").Emojii_Keyboard();
            this.$popup.modal('show');
        },

        _showPopupRepeat : function (d, id, caption, firstcomment) {
        	var date = new Date();
            this._elem('modalId').val(id);
        	this._elem('caption').val(caption);
            this._elem( 'firstcomment' ).val( firstcomment );
            if(timeDatePickerPref === 'new'){
                this._elem('timepicker').mobiscroll('setVal',date,true);
                this._elem('datepicker').mobiscroll('setVal',date,true);
            }else{
                this._elem('timepicker').timepicker('setTime', date);
                this._elem('datepicker').datepicker('setDate', date);
            }
            this._elem('repost').val(true);
            $(".emojii_keyboard").Emojii_Keyboard();
            this.$popup.modal('show');
        },

        _showPopupCancel: function (id) {
          this._elem('cancelModalId').val(id);
          this.$cancelPopup.modal('show');
        },

        _showPopupRemove: function (id) {
          this._elem('removeModalId').val(id);
          this.$removePopup.modal('show');
        }

    });

})(jQuery);
