document.addEventListener('DOMContentLoaded', function() {


  let inbox = document.querySelector("#inbox");
  let sent = document.querySelector("#sent");
  let archived = document.querySelector("#archived");
  let compose = document.querySelector("#compose");
  let composeForm = document.querySelector("#compose-form");

  // Use buttons to toggle between mailboxes and compose
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

  // Send mail
  composeForm.onsubmit = () => {
    let recipients = document.querySelector("#compose-recipients").value;
    let subject = document.querySelector("#compose-subject").value;
    let body = document.querySelector("#compose-body").value;
    // console.log(recipients);
    // console.log(subject);
    // console.log(body);
    send(recipients, subject, body);
    // Stop form from submitting
    return false;
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

////////////////////////////////////////////////////////////////////
function toggle_nav(nav) {
  let navs = document.querySelectorAll(".nav-link");
  let selected = document.getElementById(nav);

  navs.forEach(nav => {
    nav.classList.remove("active");
  });
  selected.classList.add('active');
}


function compose_email() {
  // Remove active class in nav when compose button is clicked
  let navs = document.querySelectorAll(".nav-link");
  navs.forEach(nav => {
    nav.classList.remove("active");
  });

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  let recipients = document.querySelector("#compose-recipients");
  let subject = document.querySelector("#compose-subject");
  let body = document.querySelector("#compose-body");

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

}


function send(recipients, subject, body) {
  fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
});
load_mailbox("sent");
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
        div.classList.add("text-center");
        div.innerHTML = "No emails";
      }

      // Not empty
      emails.forEach(email => {
        let div = document.querySelector("#content");

        let table = document.createElement("table");
        table.setAttribute("class", "table table-hover");
        // table.setAttribute("id", "emailcontainer");
        
        let tr = document.createElement("tr");

        // archive
        let tdArchive = document.createElement("td");
        tdArchive.setAttribute("class", "col-1");
        let tdArchiveButton = document.createElement("button");
        tdArchiveButton.setAttribute("class", "btn btn-sm btn-danger");
        tdArchiveButton.innerHTML = `<i class="bi bi-archive"></i>`;
        tdArchive.appendChild(tdArchiveButton);
        // sender/recipient
        let tdSender = document.createElement("td");
        tdSender.setAttribute("class", "col-3 align-middle");
        if (mailbox == "sent") {
          tdSender.innerHTML = `recipients ${email.recipients}`;
        } else {
          tdSender.innerHTML = `sender ${email.sender}`;
        }
        
        // subject
        let tdSubject = document.createElement("td");
        tdSubject.setAttribute("class", "col-6 align-middle");
        tdSubject.innerHTML = `${email.subject}`;
        // timestamp
        let tdTimestamp = document.createElement("td");
        tdTimestamp.setAttribute("class", "col-2 align-middle text-end");
        tdTimestamp.innerHTML = `${email.timestamp}`;

        // add td to tr
        tr.appendChild(tdArchive);
        tr.appendChild(tdSender);
        tr.appendChild(tdSubject);
        tr.appendChild(tdTimestamp);

        // add tr to table
        table.appendChild(tr);

        // add table to div
        div.appendChild(table);
      });

      

      // title.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

      // emails.forEach(email => {
      //   let emailcontainer = document.querySelector("#emailcontainer");
      //   let tr = document.createElement("tr");
      // });

  });

}

