/**
 * Created by paolini on 13/03/16.
 */

var replace_bits = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

notes = {};

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
    $("#" + id).html(html);
    $("#button_edit_" + id).click(function() {note_edit(id);});
    $("#button_save_" + id).click(function() {note_save(id);});
}

function note_init(id, text) {
    notes[id] = {text: text, initial: text};
    note_display(id);
}

function div_init() {
    note_init($(this).attr("id"), $(this).attr("initial"));
}

function note_edit(id) {
    $("#" + id).html("<button id='button_" + id + "'>done</button><br /><textarea id='edit_" + id + "'>" + notes[id].text + "</textarea>");
    $("#button_" + id).click(function() {note_change(id);});
}

function note_change(id) {
    notes[id].text = $("#edit_" + id).val();
    note_display(id);
}

function note_save(id) {
    var options = {
        method: "POST",
        data: {
            id: id,
            text: notes[id].text
        },
        success: function(data) {
            note_init(id, data.text);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus + " " + errorThrown);
        }
    };
    $.ajax("", options);
}

$(function() {
    $(".note").each(div_init);
})