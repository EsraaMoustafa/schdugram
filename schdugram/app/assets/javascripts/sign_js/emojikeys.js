function Emojii_Keyboard(el) {

    this.rendered = false;
    this.modal = null;
    this.input = el;
    this.btn = null;
    this.$documentBody = $("body").first();
    this.parent = this.input.parent();

    this.render();
    this.renderSampleModal();
}

Emojii_Keyboard.prototype.renderSampleModal = function () {

    if ($("#tabs-container-sample").length !== 0) {
        return;
    }

    this.$documentBody.append('<div id="tabs-container-sample"><ul class="tabs"></ul></div>');
    this.input.trigger("ek.sample-container-rendered");

    var $container = $("#tabs-container-sample"),
        $tabs = $container.find(".tabs"),
        _i = 1,
        current,
        html,
        self = this;

    $("<button/>").attr({
        "class": "close",
        "type": "button"
    }).html('<span aria-hidden="true">×</span><span class="sr-only"></span>').prependTo($container);

    if ($container.attr("rendered")) {
        return;
    }

    for (var group in EP_emotions) {
        if (!EP_emotions.hasOwnProperty(group)) continue;
        current = "";
        html = "";

        if (_i == 1) current = "current";
        $tabs.append('<li class="tab-link ' + current + '" data-tab="tab-' + _i + '">' + group + '</li>');
        EP_emotions[group].forEach(function (item) {
            html += "<span>" + item + "</span>";
        });
        $tabs.after($("<div/>").html(html).attr({
            id: "tab-" + _i,
            class: "tab-content " + current
        }));
        _i++;
    }

    $container.attr({
        rendered: true
    });

    $(".tab-content").minEmoji();
};

Emojii_Keyboard.prototype.btnClick = function (event) {

    event.preventDefault();

    var self = this,
        hash = new Array(5).join().replace(/(.|$)/g, function () {
            return ((Math.random() * 36) | 0).toString(36);
        }),
        position = this.input.position();

    if (!self.rendered) {
        self.modal = $("<div/>")
            .html($("#tabs-container-sample").clone().attr({
                id: hash
            }))
            .attr({
                class: "emoji-menu"
            })
            .css({
                top: (position.top + this.input.height() + 8) + "px",
                left: "0px"
            }).appendTo(this.parent);


        $('#' + hash + ' ul.tabs li').click(function () {
            var tab_id = $(this).attr('data-tab');

            $('#' + hash + ' ul.tabs li').removeClass('current');
            $('#' + hash + ' .tab-content').removeClass('current');

            $(this).addClass('current');
            $('#' + hash + ' #' + tab_id).addClass('current');
        });
        self.rendered = true;

        $("html").click(function (e) {
            if ($(e.target).closest(".emoji-menu").length == 0 && $(e.target).closest(".modal-btn").length == 0) {
                self.modal.hide();
                self.input.trigger("ek.modal-window-hide");
            }
        });

        $('#' + hash + ' .em').click(function () {
            var character = $(this).attr("data-char"),
                caretPos = self.input[0].selectionStart,
                prevText = self.input.val();

            self.input.val(prevText.substring(0, caretPos) + character + prevText.substring(caretPos));
        });

        self.parent.find(".close").first().click(function (event) {
            event.preventDefault();
            self.modal.hide();
        });

        self.input.trigger("ek.modal-window-rendered");
    } else {
        self.modal.show();
    }
    self.input.trigger("ek.modal-window-show");
};

Emojii_Keyboard.prototype.render = function () {
    var self = this;

    if(self.input.attr("data-rendered") == "true") return false;
    this.btn = $("<button/>")
        .html('<img src="data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==" style="vertical-align: middle;" class="em emj1">')
        .css({
            "vertical-align": "top",
            "margin": 0
        })
        .attr({
            class: "modal-btn"
        });

    this.btn.click(self.btnClick.bind(self));
    this.input.after(this.btn);
    this.input.css({
        "min-height": "19px"
    });
    this.input.attr({"data-rendered": true});
    this.parent.css({position: "relative"});
};

(function ($) {
    // jQuery plugin wrapper
    $.fn.Emojii_Keyboard = function () {
        return this.each(function () {
            new Emojii_Keyboard($(this))
        });
    };
})(jQuery);