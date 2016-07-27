(function ($) {

    $.widget('role.b-aviary', {

        _create: function () {
            var _this = this;

            var featherEditor = new Aviary.Feather({
                apiKey: '745b2254e53d4c71ab0f974af53d86ba',
                authenticationURL:'/generateSignature',
                //enableCORS:true,
                theme: 'light',
                tool: 'all',
                onSaveButtonClicked: function(){
                    featherEditor.saveHiRes();
                	return false;
                },
                onSaveHiRes: function (imageID, newURL) {
                    _this.element.attr('src', newURL);
                    _this._trigger(':update', {}, newURL);
                    featherEditor.close();
                },
                onError: function (errorObj) {
                    console.log('error ', errorObj);
                    alert(errorObj.message);
                },
                cropPresets: [
                    ['Square', '1:1']
                ]
            });
            this.$featherEditor = featherEditor;

            this.element.click(this._proxy(function () {
                featherEditor.launch({
                    image: this.element.get(0),
                    hiresUrl: this.element.get(0).src,
                    noCloseButton: false,
                    displayImageSize: true,
                    initTool: 'crop'
                });
            }));

            this.element.on('b-aviary:open', this._proxy(function () {
                featherEditor.launch({
                    image: this.element.get(0),
                    hiresUrl: this.element.get(0).src,
                    noCloseButton: false,
                    forceCropPreset: ['Square', '1:1'],
                    forceCropMessage: 'Please crop your picture:',
                    displayImageSize: true,
                    maxSize:1080,
                    hiresMaxSize: 1300,
                    initTool:'crop'
                });
            }));
        }

    });

})(jQuery);
