/**
 * Created by paolini on 13/03/16.
 */
{% load i18n %}

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

var notes = {}; // hash -> {div_id: ..., text: ..., initial: ...}

var enable_markdown = true;

function render(str) {
    if (enable_markdown) {
        return markdown.toHTML(str);
    } else {
        str = String(str).replace(/[&<>"'\/]/g, function (s) {
            return replace_bits[s];
        });
        return "<p>" + str + "</p>";
    }
}

function ajax_error(jqXHR, textStatus, errorThrown) {
    alert(textStatus + " " + errorThrown);
}

function note_url(hash) {
    return "{{ settings.BASE_URL }}note/" + hash + "/";
}

function note_is_modified(hash) {
    var obj = notes[hash];
    return !(obj.title == obj.initial_title && obj.text == obj.initial_text);
}

function note_display(hash) {
    var html = "";
    var note = notes[hash];
    author = note.author;
    if (!author || author == user_id) {
        html += "<button id='button_edit_" + hash + "'>{% trans "modifica" %}</button>\n";
    }
    if (note_is_modified(hash)) {
        html += "<button id='button_save_" + hash + "'>{% trans "salva" %}</button>\n";
    }
    html += "<br />\n";
    html += "<h1 id='h1_" + hash + "'>" + note.title + "</h1>\n"
    html += render(note.text);
    $div = $("#" + note.div_id);
    $div.html(html);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, note.div_id]);
    $("#button_edit_" + hash).click(function() {note_edit(hash);});
    $("#button_save_" + hash).click(function() {note_save(hash);});
    $("#button_clone_" + hash).click(function() {note_clone(hash);});
    $("head title").html(note.title);
}

function note_reset(hash, data) {
    notes[hash].title = data.title;
    notes[hash].initial_title = data.title;
    notes[hash].text = data.text;
    notes[hash].initial_text = data.text;
    notes[hash].author = data.author;
    note_display(hash);
}

function note_init(hash, div_id) {
    $.ajax(note_url(hash), {
        method: "GET",
        accepts: "application/json",
        error: ajax_error,
        data: {'json': 1},
        success: function(data) {
            var edit = !!getURLParameter("edit");
            notes[hash] = {div_id: div_id};
            note_reset(hash, data);
            if (edit)
                note_edit(hash);
        }
    });
}

function note_edit(hash) {
    var html = "";
    html += "<button id='button_change_" + hash + "'>{% trans "mostra" %}</button>\n";
    html += "<button id='button_save_" + hash + "'>{% trans "salva" %}</button>\n";
    html += "<br />\n";
    html += "<input id='edit_title_" + hash + "' cols='80' placeholder='{% trans "scrivi qui il titolo" %}'>\n";
    html += "<textarea id='edit_" + hash + "' cols='80' rows='10'>" + notes[hash].text + "</textarea>\n";
    $("#" + notes[hash].div_id).html(html);
    $("#" + 'edit_title_' + hash).val(notes[hash].title);
    $("#button_change_" + hash).click(function() {note_change(hash);note_display(hash);});
    $("#button_save_" + hash).click(function() {note_change(hash);note_save(hash);note_display(hash);});
    $("#edit_" + hash).focus();
}

function note_change(hash) {
    notes[hash].text = $("#edit_" + hash).val();
    notes[hash].title = $("#edit_title_" + hash).val();
}

function note_save(hash) {
    $.ajax(note_url(hash), {
        method: "POST",
        data: {
            hash: hash,
            title: notes[hash].title,
            text: notes[hash].text
        },
        success: function(data) {
            note_reset(hash, data);
        },
        error: ajax_error
    });
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function div_init() {
    var hash =$(this).attr("hash")
    note_init(hash, $(this).attr("id"));
}

$(function() {
    $(".note").each(div_init);
})
