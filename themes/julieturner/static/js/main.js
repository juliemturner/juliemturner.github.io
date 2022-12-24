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
  }
};
