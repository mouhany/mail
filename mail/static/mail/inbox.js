document.addEventListener('DOMContentLoaded', function() {


  let inbox = document.getElementById("inbox");
  let sent = document.getElementById("sent");
  let archived = document.getElementById("archived");
  let compose = document.getElementById("compose");


  // Use buttons to toggle between views
  inbox.addEventListener('click', () => {
    toggle_nav("inbox");
    load_mailbox('inbox');
  });

  sent.addEventListener('click', () => {
    toggle_nav("sent");
    load_mailbox('sent');
  });

  archived.addEventListener('click', () => {
    toggle_nav("archived");
    load_mailbox('archived');
  });

  compose.addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');
});


function toggle_nav(nav) {
  let navs = document.querySelectorAll(".nav-link");
  let selected = document.getElementById(nav);

  navs.forEach(nav => {
    nav.classList.remove("active");
  });
  selected.classList.add('active');
}


function compose_email() {

  // Remove active nav
  let navs = document.querySelectorAll(".nav-link");
  navs.forEach(nav => {
    nav.classList.remove("active");
  });

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  let title = document.querySelector('#mailbox-title');
  title.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  
  // API request
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Empty
      if(emails.length == 0) {
        let div = document.getElementById("content");
        div.classList.add("text-center")
        div.innerHTML = "No emails";
      }
      // Not empty
      emails.forEach(email => {
        // ... do something else with emails ...
      })
  });

}

