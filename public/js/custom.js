// $('.jl-like-button').on('click', function() {
//   $.post('/like', function(data) {
//   if (data.clicked == true){
//     $('.jl-like-button').text('click to unlike: ' + data.likeCount);
//   } else {
//     $('.jl-like-button').text('click to like: ' + data.likeCount);
//     }
//   });
// });


// $('#search-button input').on('keyup', function() {
//    var query = $('#search-button input').val();
//    console.log($('#search-button input').val());
 
//    if (query !== "") {
//      $.get('/api/search/' + query, function(data) {
//        console.log(data);
//        $(".jl-app-search-results").html('');
//        data.forEach(function(element) {
//          $(".jl-app-search-results").append(
//            $("<li>" + element.firstname + ' ' + element.lastname + '</li>')
//            );
//          });
//        });
//      }
//    });

