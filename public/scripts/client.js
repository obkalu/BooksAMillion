$(document).ready(function(){
    $(".delete-book").on("click", function(e) {
        $target = $(e.target);
        const id = $target.attr("data-id");
        $.ajax({
            type: "DELETE",
            url: "/book/delete/"+id,
            success: function(response) {
                // alert(`Deleting the Book with id: ${id}`);
                window.location.href = "/book/browse"
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
});
