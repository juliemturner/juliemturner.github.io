var jtBlogMain = {
  showDialog: function() {
    let dialog = document.getElementsByClassName("hoo-mdldialog-outer");
    if(dialog != null){
      dialog[0].classList.add("is-visible");
    }
  },
  hideDialog: function() {
    let dialog = document.getElementsByClassName("hoo-mdldialog-outer");
    if(dialog != null){
      dialog[0].classList.remove("is-visible");
    }
  },
  showComments: function(event, disqus_shortname) {
    (function () {
      var disqus = document.createElement('script');
      disqus.type = 'text/javascript';
      disqus.async = true;
      disqus.src = '//' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(disqus);
    })();

    event.target.parentElement.hidden = true;
  }
};
