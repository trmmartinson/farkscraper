$(document).ready(function () {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    $("#scrape").click(function (event) {
        window.location.href = '/scrape';
    });
    $("#choose").click(function () {
        window.location.href = '/articles';
    });

    $("form").submit(function(){
            let article_id  = $('#article').text();
            let comment_text =  $('textarea#comments').val();
            $.post("post_comment", { article: article_id, comment: comment_text });
            alert("comment posted");
      });
    $(function () {
        $(document).on('click', '.select_article', function () {
            let title = $("#title" + this.id).text();
            let link = $("#link" + this.id).text();
            data = {
                title: "title",
                link: "link"
            };
            $.post("post_article", { link: link, title: title });
        });
        $(window).click(function (e) {

            if (event.target == modal)
                modal.style.display = "none";
        });

        $(document).on('click', '.comment_button', function () {
            var parent_id = $(this).parent().attr('id');
            $("#article_container").empty();
            $('#article').text(parent_id);
            $.ajax({
                url: '/get_comments/' + parent_id ,
                type: 'GET',
                success: function (response) {
                   let resp_array = Object.values(response);
                   for(let i = 0; i < response.notes.length; i++){
                    $( "#article_container" ).append( 
                        `<p>${response.notes[i].body}</p>
                         <button id="${response.notes[i]._id}" class="delete_note_button">Delete</button>
                         <hr>`
                  ); 
                 }
                }
            });
            modal.style.display = "block";
        });
        if (typeof span != "undefined")
            span.onclick = function () {
                modal.style.display = "none";
            }
        $(document).on('click', '.delete_article_button', function () {
            var parent_id = $(this).parent().attr('id');
            $.ajax({
                url: '/delete_article/' + parent_id,
                type: 'DELETE',
                success: function (result) {
                    alert("article deleted");
                    location.reload();
                }
            });
        });
        $(document).on('click', '.delete_note_button', function (event) {

            var parent_id = $(this).attr('id');
            $.ajax({
                url: '/delete_note/' + parent_id,
                type: 'DELETE',
                success: function (result) {
                    alert("note deleted");
                    modal.style.display = "none";
                }
            }); 
        });
    });
});