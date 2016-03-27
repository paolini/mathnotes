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

notes = {}; // hash -> {div_id: ..., text: ..., initial: ...}

function render(str) {
    str = String(str).replace(/[&<>"'\/]/g, function (s) {return replace_bits[s];});
    return "<p>" + str + "</p>";
}

function note_display(hash) {
    var html = "";
    html += "<button id='button_edit_" + hash +"'>edit</button>";
    if (notes[hash].text != notes[hash].initial) {
        html += "<button id='button_save_" + hash + "'>save</button>";
    }
    html += "<br />";
    html += render(notes[hash].text);
    $("#" + notes[hash].div_id).html(html);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, notes[hash].div_id]);
    $("#button_edit_" + hash).click(function() {note_edit(hash);});
    $("#button_save_" + hash).click(function() {note_save(hash);});
}

function ajax_error(jqXHR, textStatus, errorThrown) {
    alert(textStatus + " " + errorThrown);
}

function note_url(hash) {
    return "{{ settings.BASE_URL }}note/" + hash + "/";
}

function note_reset(hash, text, edit) {
    notes[hash].text = text;
    notes[hash].initial = text;
    note_display(hash);
    if (edit)
        note_edit(hash);
}

function note_init(hash, div_id, edit) {
    $.ajax(note_url(hash), {
        method: "GET",
        accepts: "appolication/json",
        error: ajax_error,
        data: {'json': 1},
        success: function(data) {
            notes[hash] = {div_id: div_id};
            note_reset(hash, data.text, edit);
        }
    });
}

function note_edit(hash) {
    var html = "";
    html += "<button id='button_" + hash + "'>done</button>";
    html += "<br />";
    html += "<textarea id='edit_" + hash + "' cols='80' rows='10'>" + notes[hash].text + "</textarea>";
    $("#" + notes[hash].div_id).html(html);
    $("#button_" + hash).click(function() {note_change(hash);});
    $("#edit_" + hash).focus();
}

function note_change(hash) {
    notes[hash].text = $("#edit_" + hash).val();
    note_display(hash);
}

function note_save(hash) {
    $.ajax(note_url(hash), {
        method: "POST",
        data: {
            hash: hash,
            text: notes[hash].text
        },
        success: function(data) {
            note_reset(hash, data.text);
        },
        error: ajax_error
    });
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function div_init() {
    var edit = !!getURLParameter("edit");
    var hash =$(this).attr("hash")
    note_init(hash, $(this).attr("id"), edit);
}

$(function() {
    $(".note").each(div_init);
})
