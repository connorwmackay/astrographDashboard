$(() => {
    $.getJSON("/upload/read", (data) => {
        console.log(data);
    });
});