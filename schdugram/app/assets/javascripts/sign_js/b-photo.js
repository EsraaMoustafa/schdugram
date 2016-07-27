(function ($) {

    $.fn.scrollView = function () {
        return this.each(function () {
            $('html, body').animate({
                scrollTop: $(this).offset().top - 80
            }, 1000);
        });
    };

   $.widget('role.b-photo', {
        _create: function () {
            this.$img = this._elem('img');
            var _dt = this;
            if(timeDatePickerPref === 'new'){
                _dt._elem('datepicker').mobiscroll().calendar({
                    theme: 'mobiscroll',
                    display: 'bubble',
                    defaultValue: new Date(),
                    minDate: new Date(),
                    dateFormat: 'dd-M-yy',
                    closeOnSelect:true
                });
                _dt._elem('datepicker').on('click',function(){
                    $('.date').mobiscroll('show');
                    event.stopPropagation();
                    return false;
                });
                if(timePreference=='24h'){
                    var format = 'HH:ii';
                    var timeWheels = 'HHii';
                }else{
                    format = 'hh:ii A';
                    timeWheels = 'hhiiA';
                }
                _dt._elem('timepicker').mobiscroll().time({
                    theme: 'mobiscroll',
                    display: 'bubble',
                    headerText: false,
                    timeFormat: format,
                    timeWheels: timeWheels,
                    steps:{minute:5,zeroBased:true}
                });

                _dt._elem('timepicker').on('click',function(){
                    $('.time').mobiscroll('show');
                    event.stopPropagation();
                    return false;
                });
            }else{
                if(timePreference == '24h'){
                    var meridian = false;
                }else{
                    meridian = true;
                }
                _dt._elem('timepicker').timepicker({
                    minuteStep: 5,
                    showMeridian: meridian,
                    disableMousewheel:true
                });
                _dt._elem('datepicker').datepicker({
                    autoclose: true,
                    todayHighlight: true,
                    format: "dd-M-yyyy"
                });
            }
            this.element.on('b-uploadform:success', this._proxy(function (e, url) {
                $(window).bind('beforeunload', function (){return 'Are you sure you want to leave this page? There may be unsaved posts.';});
                this._setSrc(url);
                var date = new Date();
                _dt._elem('timepicker').val('');
                _dt._elem('datepicker').val('');
            }));

            this._elem('cancelButton').click(this._proxy(function () {
                var r = confirm("Are you sure you want to cancel scheduling this post?");
                if (r == true) {
                    this._cancel();
                } else {
                    // do nothing
                }
            }));

            this._elem('resetButton').click(this._proxy(function () {
                this._setSrc(this.$img.data('url'));
            }));

            this.element.on('b-aviary:update', this._proxy(function () {
                this._setMod('post');
                this._delMod('error');
            }));

            this._elem('postButton').click(this._proxy(function () {
                if($('input[name=posttime]:checked').val()=='now'){
                    this._postPhoto(true);
                }else{
                    this._postPhoto(false);
                }

            }));
            this._elem('schedule').change(function(){
            	//if(this.checked){
            		_dt._elem('datepicker_lbl').toggle();
            		_dt._elem('timepicker_lbl').toggle();
            		_dt._elem('postButton').toggle();
            		_dt._elem('ctrl_lbl').toggle();
            	//} else {
            	//	_dt._elem('datepicker').show();
            	//	_dt._elem('timepicker').show();
            	//}
            })
        },

        _cancel: function () {
            this._delMod('img');
            this._delMod('post');
            this.$img.attr('src', '');
        },

        _setSrc: function (url) {
            this.$img.attr('src', url);
            this.$img.data('url', url);

            this._delMod('post');
            this._delMod('error');
            this._delMod('success');
            this._setMod('img');

            this._elem('img').trigger('b-aviary:open');
        },

        _postPhoto: function (isNow) {
            console.log(isNow);
            var data = {},
                _this = this,

                failCb = function (message) {
                    _this._setMod('error');
                    if (typeof message == 'string') {
                        _this._elem('errorMessage').text(message);
                        _this._elem('errorMessage' ).scrollView();
                        // scroll up
                    } else {
                        for (var key in message) {
                            _this._elem('errorMessage').text(message[key]);
                            _this._elem('errorMessage' ).scrollView();
                        }
                    }
                };

            if (this._hasMod('posting')) {
                return false;
            }

            data.accountIds = $('.b-accountList')['b-accountList']('getActiveIds').join(',');
            data.src = this.$img.attr('src');
            if(timeDatePickerPref=='new'){
                var demodate = this._elem('datepicker').val();
            } else {
                demodate = this._elem('datepicker').val();
            }
            console.log(demodate);
            console.log(demodate!="");
            if(isNow && (demodate !== null || demodate !=='')){
                var r = confirm("Are you sure you want to post this image now?");
                if (r == true) {
                    //continue
                } else {
                    return;
                }
            }
            if(!isNow){
                if(timeDatePickerPref=='new'){
                    var time = this._elem('timepicker').val();
                    var date = this._elem('datepicker').val();
                    var jsdate = this._elem('datepicker').mobiscroll('getDate');
                } else {
                    time = this._elem('timepicker').data('timepicker').getTime();
                    date = this._elem('datepicker').val();
                    jsdate = this._elem('datepicker').datepicker('getDate');
                }
                if(!isNow && (date==''|| date==null || time == '' || time==null)){
                    console.log(date);
                    console.log(time);
                    var r = confirm("Are you sure you want to post this image? It looks like you have not selected a date or time.");
                    if (r == true) {
                        //continue
                    } else {
                        return;
                    }
                }
                var datestring=date.substr(0,3)+(jsdate.getMonth()+1)+date.substr(6,5),
                    date2=moment(datestring,"DD-M-YYYY" );
                if(timePreference =='24h'){
                    var mFormat = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
                    var m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm');
                }else {
                    mFormat = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A').format('YYYY-MM-DD HH:mm');
                    m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A');
                }
                data.when = m.isValid() ? mFormat : failCb("Format of your date or time is not correct");
            } else{
                data.when = moment(new Date(Date.now()+60*1000)).format('YYYY-MM-DD HH:mm');
            }

            data.isNow = isNow;
            data.caption = this._elem('caption').val();
            data.firstcomment = this._elem( 'firstcomment' ).val();
            data.notification = this._elem('notification').is(':checked');

            this._setMod('posting');
            this._delMod('error');
            this._delMod('success');
            this._elem('postButton').button('loading');
            _this._elem('postButton').attr('disabled', true);

            $.post(this.options.url, data)
                .fail(function () {
                    failCb('There was an error sending these jobs to the server. Please try again, or if the problem persists submit a support ticket.');
                })
                .always(function () {
                    _this._delMod('posting');
                    _this._elem('postButton').button('reset');

                    _this._elem('postButton').attr('disabled', false);
                })
                .done(function (res) {
                    if (res.status == 'ok') {
                        $(window).unbind('beforeunload');
                        _this._delMod('img');
                        _this._delMod('post');
                        _this.$img.attr('src', '');
                        _this._setMod('success');
                        _this._elem('caption').val('');
                        _this._elem( 'firstcomment' ).val( '' );
                    } else {
                        failCb(res.message);
                    }
                });
        }
    });

})(jQuery);
