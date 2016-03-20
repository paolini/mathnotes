/**
 * Created by paolini on 13/03/16.
 */

MathJax.Hub.Config({
    skipStartupTypeset: true,
    tex2jax: {
        inlineMath: [ ['$','$'], ['$$','$$'] ]
    }
});

/* http://stackoverflow.com/questions/19333098/403-forbidden-error-when-making-an-ajax-post-request-in-django-framework */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
// console.log("csrftoken: " + csrftoken);
//Ajax call
function csrfSafeMethod(method) {
// these HTTP methods do not require CSRF protection
return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var replace_bits = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

notes = {}; // id -> {div_id: ..., text: ..., initial: ...}

function render(str) {
    str = String(str).replace(/[&<>"'\/]/g, function (s) {return replace_bits[s];});
    return "<p>" + str + "</p>";
}

function note_display(id) {
    var html = "";
    html += "<button id='button_edit_" + id +"'>edit</button>";
    if (notes[id].text != notes[id].initial) {
        html += "<button id='button_save_" + id + "'>save</button>";
    }
    html += "<br />";
    html += render(notes[id].text);
    $("#" + notes[id].div_id).html(html);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, notes[id].div_id]);
    $("#button_edit_" + id).click(function() {note_edit(id);});
    $("#button_save_" + id).click(function() {note_save(id);});
}

function ajax_error(jqXHR, textStatus, errorThrown) {
    alert(textStatus + " " + errorThrown);
}

function note_url(id) {
    return "{{ settings.BASE_URL }}note/" + id + "/";
}

function note_reset(id, text) {
    notes[id].text = text;
    notes[id].initial = text;
    note_display(id);
}

function note_init(id, div_id) {
    $.ajax(note_url(id), {
        method: "GET",
        accepts: "appolication/json",
        error: ajax_error,
        data: {'json': 1},
        success: function(data) {
            notes[id] = {div_id: div_id};
            note_reset(id, data.text);
        }
    });
}

function note_edit(id) {
    var html = "";
    html += "<button id='button_" + id + "'>done</button>";
    html += "<br />";
    html += "<textarea id='edit_" + id + "' cols='80' rows='10'>" + notes[id].text + "</textarea>";
    $("#" + notes[id].div_id).html(html);
    $("#button_" + id).click(function() {note_change(id);});
}

function note_change(id) {
    notes[id].text = $("#edit_" + id).val();
    note_display(id);
}

function note_save(id) {
    $.ajax(note_url(id), {
        method: "POST",
        data: {
            id: id,
            text: notes[id].text
        },
        success: function(data) {
            note_reset(id, data.text);
        },
        error: ajax_error
    });
}

function div_init() {
    note_init($(this).attr("pk"), $(this).attr("id"));
}

$(function() {
    $(".note").each(div_init);
})
