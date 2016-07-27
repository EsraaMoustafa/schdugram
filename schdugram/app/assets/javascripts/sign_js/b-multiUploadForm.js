(function ($) {

    $.fn.scrollView = function () {
        return this.each(function () {
            $('html, body').animate({
                scrollTop: $(this).offset().top - 80
            }, 1000);
        });
    };

    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    $.widget('role.b-multiUploadForm', {

        _create: function () {
            var _this = this;
            $("#initUpload, #innerUpload").on("click", function(){
                $("#fileupload").trigger("click");
            });
            $("#outerUpload").on("click", function(){
                console.log("clicked filepicker io");
                $(".filepicker-button").trigger("click")
            });
            $("#canvaUpload").on("click", function(){
                console.log("clicked canva button");
                $("#canva-1-canva-button").trigger("click");
            });
            var appendSection = function(resp) {
                $('.b-multiUploadForm__contentBlock').show();
                if (resp.status == 'ok') {
                    $(window).bind('beforeunload', function (){return 'Are you sure you want to leave this page? There may be unsaved posts.';});
                    var body = $('#tbody');
                    body.append(resp.data);
                    $(".count").keyup(function () {
                        var id = '#'+$(this).attr("id")+"_chars";
                        var len =$(this).val().length;
                        $(id).text(len);
                    });
                    $(".emojii_keyboard").Emojii_Keyboard();
                    if(timeDatePickerPref === 'new'){
                        $('.date').mobiscroll().calendar({
                            theme: 'mobiscroll',
                            display: 'bubble',
                            defaultValue: new Date(),
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
                        $('.time').mobiscroll().time({
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
                        $('.time').timepicker({
                            minuteStep: 5,
                            showMeridian: meridian,
                            disableMousewheel:true
                        });
                        $('.date').datepicker({
                            autoclose: true,
                            todayHighlight: true,
                            format: "dd-M-yyyy"
                        });
                    }
                    var thedate = moment();
                    body.sortable({
                        handle: ".handle"
                    });
                    var table = $('.footable').footable();
                    table.trigger('footable_redraw');
//                    	$('.date').datepicker('setDate', thedate.toDate());
                    _this._elem('removeButton').click(function(){
                        $(this).parents('tr').remove();
                    });

                    var editButton = $("#new-item"),
                        origUrl = $(editButton).data("url"),
                        uniqueID = origUrl.split("/")[origUrl.split("/").length - 1].split(".")[0];

                    $(editButton).attr("id", "edit-" + uniqueID);
                    $(editButton).on("click", function(){
                        var img = $(this).parent().find(".aviary-img")[0];
                        console.log("edit, img url: ", origUrl)
                        $(img).attr("id", uniqueID);
                        featherEditor.launch({
                            image: uniqueID,
                            url: origUrl,
                            hiresUrl: origUrl,
                            noCloseButton: false
                        });
                    });
                } else if (resp.status == 'error') {
                    _this._setMod('error');
                    _this._elem('errorMessage').text(resp.message);
                }
            };

            var addImage = function() {
                //_this._disableUpload(true);
                _this._delMod('error');
                _this._setMod('uploading');
                $.ajax({
                    type: "POST",
                    url: "/photo/multiUpload",
                    data: $('form[role="b-multiUploadForm"]').serialize(), // serializes the form's elements.
                    success: function(data)
                    {
                        var resp = data;
                        appendSection(resp);
                        _this._delMod('uploading');

                    }
                });
            };

            $("#outerUrl").on("change", function(e){
                addImage()
            });

            designCallback = function(url){
                console.log(url);
                $("#outerUrl").val(url);
                addImage();
            };

            var featherEditor = new Aviary.Feather({
                apiKey: '745b2254e53d4c71ab0f974af53d86ba',
                authenticationURL:'/generateSignature',
                theme: 'light',
                //enableCORS:true,
                tool: 'all',
                onSaveButtonClicked: function(){
                    featherEditor.saveHiRes();
                    return false;
                },
                onSaveHiRes: function (imageID, newURL) {
                    console.log("previous url: ", this.url);
                    console.log("new url: ", newURL);
                    var thumbnailImage = $("#edit-" + imageID).parent().find(".thumbnailImage");
                    $(thumbnailImage).attr("src", newURL);
                    $("#" + imageID).attr("src", newURL);
                    featherEditor.close();
                },
                onError: function (errorObj) {
                    alert(errorObj.message);
                },
                cropPresets: [
                    ['Square (optional)', '1:1']
                ]
            });

            this.$submitButton = this._elem('submitButton');
            this.$button = this._elem('button');

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
                	$('.b-multiUploadForm__contentBlock').show();
                    var resp = data.result;
                    appendSection(resp);
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
        	$('.b-multiUploadForm__contentBlock').hide();
        },

        _postPhoto: function (isNow) {
            var data = {},
                _this = this,

                failCb = function (message) {
                    _this._setMod('error');
                    if (typeof message == 'string') {
                        _this._elem('errorMessage').text(message);
                        _this._elem('errorMessage' ).scrollView();
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
            data.items = [];
            $('.uploadItem').each(function(index){
            	var item = {};
            	item.src = $(this).find('img').attr('src');
                if(timeDatePickerPref=='new'){
                    var time = $(this).find('.time').val();
                    var date = $(this).find('.date').val();
                    var jsdate = $(this).find('.date').mobiscroll('getDate');
                } else {
                    time = $(this).find('.time').data('timepicker').getTime();
                    date = $(this).find('.date').val();
                    jsdate = $(this).find('.date').datepicker('getDate');
                }


                if(!moment(jsdate ).isValid()){
                    failCb('One or more date fields is empty.');
                    throw new Error();
                } else if (item.src == null){
                    failCb('One or more images has not uploaded correctly – you will see a \'broken\' image below. Please remove it and re-upload.');
                    throw new Error();
                } else {
                    var datestring = date.substr( 0, 3 ) + (jsdate.getMonth() + 1) + date.substr( 6, 5 ),
                        date2 = moment( datestring, "DD-M-YYYY" );
//                    mFormat = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A').format('YYYY-MM-DD HH:mm');
                    if (date) {
                        if(timePreference =='24h'){
                            var mFormat = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
                            var m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm');
                        }else {
                            mFormat = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A').format('YYYY-MM-DD HH:mm');
                            m = moment(date2.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD HH:mm A');
                        }
                    }
//                console.log(m);
                    item.when = m.isValid() && !isNow ? mFormat : 0;
                    console.log( item.when );
                    item.caption = $( this ).find( '.caption' ).val();
                    item.origUrl = $( this ).find('[name="origUrl"]').val();
                    item.firstcomment = $( this ).find( '.firstcomment' ).val();
                    item.notification = $( this ).find( '.notification' ).is( ':checked' );
                    data.items.push( item );
                }
            });


            this._setMod('posting');
            this._delMod('error');
            this._delMod('success');
            this._elem('postButton').button('loading');
            _this._elem('postButton').attr('disabled', true);

            $.post(this.options.url, data)
                .fail(function (jqXHR, textStatus, errorThrown) {
                    failCb([textStatus,errorThrown]);
                })
                .always(function () {
                    _this._delMod('posting');
                    _this._elem('postButton').button('reset');
                    _this._elem('postButton').attr('disabled', false);
                })
                .done(function (res) {
                    if (res.status == 'ok') {
                        $(window).unbind('beforeunload');
                    	$('#tbody').html('');
                    	$('.b-multiUploadForm__contentBlock').hide();
                        _this._setMod('success');
                    } else {
                        failCb(res.message);
                    }
                });
        }

    });

})(jQuery);
