$.fn.serializeMap = function () {
	var m = {},
		a = this.serializeArray ();

	for (var j = 0; j < a.length; j++) {
		var it = a[j];
		m[it.name] = it.value;
	}

	return m;
};


jQuery (document).ready (function () {
    jQuery(document.body).addClass ('ready');
    Loading.init ();
    jQuery (document).on ('click', '.ws-ui-act', function (e) {
        var target = jQuery (this),
            action = target.data ('action');

        ux_action ({
            target: jQuery (this),
            action: action,
            origEvent: e
        });
    })
});



var Delay = function (time) {
    var jD  = $.Deferred (),
        t   = null;

    t = setTimeout (function () {
        jD.resolve ();
    }, time || 500);
    jD.clear = function () { clearTimeout (t) };

    return jD;
}


var Loading = function () {
    var initd       = false,
        view        = { };

    function init () {
        if (!initd) {
            initd = true;
            view.panel = jQuery ('#Loading');
            bootstrap ();
        }
    }
    
    function page (bool) {
        if (bool === true)
            view.panel.addClass ('active');
        else
            Delay (300).then (function () {
                view.panel.removeClass ('active');
            });
    }

    function bootstrap () {

    }

    return {
        page: page,
        init: init
    }
}();



function ux_action (status) {
    if (status.action === 'create-conference') {
        create_conference (status);
    }
}

function create_conference (status) {
    if (validate_fields ()) {
        var bounding_box    = status.target.offset (),
            item_x          = bounding_box.left,
            item_y          = bounding_box.top,
            screen_width    = jQuery (window).width (),
            screen_height   = jQuery (window).height (),

            desired_x       = screen_width / 2 - item_x - 40
            desired_y       = -(screen_height/2),
            transform_css   = "translate3d("+ desired_x +"px, "+ desired_y +"px, 0) scale3d(30,30,30)"; // scale(n)

        jQuery ('.loader-overlay').addClass ('focusing').css ({
            transform: transform_css
        });
        Delay (400).then (function () {
            Loading.page (true);
            send_data ().then (function (result) {
                Delay (500).then (function () {
                    jQuery ('#Confirm').addClass ('active');
                    jQuery ('.conference-id', '#Confirm').text (result.key)
                })
            })
        })
    } else {
        // console.log ('===> error');
        scrollTo (0, 1)
    }
}

function validate_fields () {
    var valid = true;
    jQuery ('.participants .partecipant-row :input, .other-details :input').each (function () {
        var it  = jQuery (this),
            val = it.val().trim ();

        if (val == '')
            it.addClass ('error'),
            valid = false;
    });

    return valid;
}

function send_data () {
    var jD = jQuery.Deferred (),
        other_settings = jQuery ('.other-details :input').serializeMap (),
        request_json = {
            "record": false,
            "beepOnEntry": false,
            "entryGreeting": other_settings.entryGreeting,
            "participants": []
        };

    jQuery ('.participants .partecipant-row').each (function () {
        var row         = jQuery (this),
            row_data    = row.find (':input').serializeMap (),
            is_mod      = row.data ('is-mod'),
            radio_name  = row.data ('radio'),
            participant_entry = {
                "Name": row_data.Name,
                "department": "",
                "participantPhone": "",
                "sipUri": row_data.sipUri,
                "isMod": is_mod,
                "phoneType": row_data[radio_name]
            };

        request_json.participants.push (participant_entry);
    });

    if (other_settings.record)
        request_json.record = true;

    if (other_settings.beepOnEntry)
        request_json.beepOnEntry = true;

    // console.log (JSON.stringify (request_json, null, '   '));
    jQuery.ajax ({
        type: 'POST',
        url: '/createConference',
        data: {
            data: JSON.stringify (request_json)
        }
    }).done (function (result) {
        console.log (JSON.stringify (result, null, '   '))
        jD.resolve (result);
    });

    return jD;
}
