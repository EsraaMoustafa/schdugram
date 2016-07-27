(function ($) {

    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    $.widget('role.b-video', {

        _create: function () {
            this.$submitButton = this._elem('submitButton');
            this.$button = this._elem('button');
            var _this = this;

            var appendSection = function(resp) {
                $('.b-video__contentBlock').show();
                if (resp.status == 'ok') {
                    $(".uploadButton").attr('disabled', true);
                    $('#tbody').append(resp.data);
                    console.log('A');
                    if(timeDatePickerPref === 'new'){
                        $('.date').mobiscroll().calendar({
                            theme: 'mobiscroll',
                            display: 'bubble',
                            defaultValue: new Date(),
                            minDate: new Date(),
                            dateFormat: 'dd-M-yy',
                            closeOnSelect:true
                        });
                        $('.date').on('click',function(){
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
                        $('.time').mobiscroll().time({
                            theme: 'mobiscroll',
                            display: 'bubble',
                            headerText: false,
                            timeFormat: format,
                            timeWheels: timeWheels,
                            steps:{minute:5,zeroBased:true}
                        });

                        $('.time').on('click',function(){
                            $('.time').mobiscroll('show');
                            event.stopPropagation();
                            return false;
                        });
                    }else{
                        console.log('B');
                        if(timePreference == '24h'){
                            var meridian = false;
                        }else{
                            meridian = true;
                        }
                        $('.time').timepicker({
                            minuteStep: 5,
                            showMeridian: meridian,
                            disableMousewheel:true
                        });
                        console.log('C');
                        $('.date').datepicker({
                            autoclose: true,
                            todayHighlight: true,
                            format: "dd-M-yyyy"
                        });
                        console.log('D');
                    }
//                    	$('.date').datepicker('setDate', thedate.toDate());
                    _this._elem('removeButton').click(function(){
                        $(this).parents('tr').remove();
                    });
                } else if (resp.status == 'error') {
                    _this._setMod('error');
                    _this._elem('errorMessage').text(resp.message);
                }
            };

            $("#fpinput").on("change", function(e){
                //_this._disableUpload(true);
                _this._delMod('error');
                _this._setMod('uploading');
                $.ajax({
                    type: "POST",
                    url: "/video/upload",
                    data: $('form[role="b-video"]').serialize(),
                    success: function(data)
                    {
                        var resp = data;
                        appendSection(resp);
                        _this._delMod('uploading');
                    }
                });
            });

            this.element.fileupload({
                dataType: 'json',
                autoUpload: true,
                dropZone: this.element,
                add: this._proxy(function (e, data) {
                    this._disableUpload(true);
                    this._delMod('error');
                    this._setMod('uploading');
                    data.submit();
                }),
                done: this._proxy(function (e, data) {
                    $('.b-video__contentBlock').show();
                    var resp = data.result;
                    if (resp.status == 'ok') {
                        $(".uploadButton").attr('disabled', true);
                        $('#tbody').append(resp.data);
                        $(".emojii_keyboard").Emojii_Keyboard();
                            if (timeDatePickerPref === 'new') {
                                $('.date').mobiscroll().calendar({
                                    theme: 'mobiscroll',
                                    display: 'bubble',
                                    defaultValue: new Date(),
                                    minDate: new Date(),
                                    dateFormat: 'dd-M-yy',
                                    closeOnSelect: true
                                });
                                $('.date').on('click', function () {
                                    $('.date').mobiscroll('show');
                                    event.stopPropagation();
                                    return false;
                                });
                                if (timePreference == '24h') {
                                    var format = 'HH:ii';
                                    var timeWheels = 'HHii';
                                } else {
                                    format = 'hh:ii A';
                                    timeWheels = 'hhiiA';
                                }
                                $('.time').mobiscroll().time({
                                    theme: 'mobiscroll',
                                    display: 'bubble',
                                    headerText: false,
                                    timeFormat: format,
                                    timeWheels: timeWheels,
                                    steps: {minute: 5, zeroBased: true}
                                });

                                $('.time').on('click', function () {
                                    $('.time').mobiscroll('show');
                                    event.stopPropagation();
                                    return false;
                                });
                            } else {
                                console.log('B');
                                if (timePreference == '24h') {
                                    var meridian = false;
                                } else {
                                    meridian = true;
                                }
                                $('.time').timepicker({
                                    minuteStep: 5,
                                    showMeridian: meridian,
                                    disableMousewheel: true
                                });
                                console.log('C');
                                $('.date').datepicker({
                                    autoclose: true,
                                    todayHighlight: true,
                                    format: "dd-M-yyyy"
                                });
                                console.log('D');
                            }
                            _this._elem('removeButton').click(function () {
                                $(this).parents('tr').remove();
                            });
                        } else if (resp.status == 'error') {
                            this._setMod('error');
                            this._elem('errorMessage').text(resp.message);
                        }
                }),
                fail: this._proxy(function(){
                    this._setMod('error');
                    this._elem('errorMessage').text('Upload error');
                }),
                always: this._proxy(function(){
                    this._delMod('uploading');
                    this._disableUpload(false);
                })
            });
            this._elem('postButton').click(this._proxy(function () {
                this._postPhoto(false);
            }));

            this._elem('cancelButton').click(this._proxy(function () {
                this._cancel();
            }));

        },

        _disableUpload: function (dis) {
            this.$submitButton.attr('disabled', dis);
            this.$button.attr('disabled', dis);
        },

        _cancel: function () {
        	$('#tbody').html('');
        	$('.b-video__contentBlock').hide();
        },

        _postPhoto: function (isNow) {
            var data = {},
                _this = this,

                failCb = function (message) {
                    _this._setMod('error');
                    if (typeof message == 'string') {
                        _this._elem('errorMessage').text(message);
                    } else {
                        for (var key in message) {
                            _this._elem('errorMessage').text(message[key]);
                        }
                    }
                };

            if (this._hasMod('posting')) {
                return false;
            }

            data.accountIds = $('.b-accountList')['b-accountList']('getActiveIds').join(',');
            data.src = $('#src').val();
            if(timeDatePickerPref=='new'){
                var time = $('.time').val();
                var date = $('.date').val();
                var jsdate = $('.date').mobiscroll('getDate');
            } else {
                time = $('.time').data('timepicker').getTime();
                date = $('.date').val();
                jsdate = $('.date').datepicker('getDate');
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
            data.when = m.isValid() && !isNow ? mFormat : 0;
            data.caption = $('#caption').val();
            data.firstcomment = $( '#firstcomment' ).val();
            data.notification = $('.notification').is(':checked');


            this._setMod('posting');
            this._delMod('error');
            this._delMod('success');
            this._elem('postButton').button('loading');
            _this._elem('postButton').attr('disabled', true);

            $.post(this.options.url, data)
                .fail(function (err) {
                    failCb(err);
                })
                .always(function () {
                    _this._delMod('posting');
                    _this._elem('postButton').button('reset');
                    _this._elem('postButton').attr('disabled', false);
                })
                .done(function (res) {
                    if (res.status == 'ok') {
                    	$('#tbody').html('');
                    	$('.b-video__contentBlock').hide();
                        _this._setMod('success');
                    } else {
                        failCb(res.message);
                    }
                });
        }

    });

})(jQuery);
