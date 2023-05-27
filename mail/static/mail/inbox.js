document.addEventListener('DOMContentLoaded', function() {

  // Use nav in sidebar to toggle between mailboxes, compose, and send mail
  document.querySelector("#inbox").addEventListener('click', () => {
    toggle_nav('inbox');
    load_mailbox('inbox');
  });

  document.querySelector("#sent").addEventListener('click', () => {
    toggle_nav('sent');
    load_mailbox('sent');
  });

  document.querySelector("#archived").addEventListener('click', () => {
    toggle_nav('archived');
    load_mailbox('archived');
  });

  document.querySelector("#compose").addEventListener('click', compose_email);

  document.querySelector("#compose-form").onsubmit = () => {
    send();
    // Stop form from submitting
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');
});

////////////////////////////////////////////////////////////////////

function toggle_nav(selected) {
  let navs = document.querySelectorAll('.nav-link');
  let active = document.getElementById(selected);

  navs.forEach(nav => {
    nav.classList.remove('active');
  });
  active.classList.add('active');
}


function toggle_content(selected) {
  let contents = document.querySelectorAll('.content-mailbox');
  let active = document.getElementById(selected);

  contents.forEach(content => {
    content.classList.remove('d-block');
    content.classList.add('d-none');
  });
  active.classList.add('d-block');
}


function compose_email() {
  // Remove active class in nav when compose button is clicked
  let navs = document.querySelectorAll('.nav-link');
  navs.forEach(nav => {
    nav.classList.remove('active');
  });

  // Delete error message (if any)
  document.querySelector('#errormessage').innerHTML = "";

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = '';
  document.querySelector("#compose-subject").value = '';
  document.querySelector("#compose-body").value = '';
}


function load_mailbox(mailbox) {
  toggle_content(mailbox);

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  let emailsView = document.querySelector("#emails-view");
  emailsView.innerHTML = `<h3 id="mailbox-title" class="comfortaa px-3 d-inline-block">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Response message (email sent)
  let responseMessage = document.createElement("span");
  responseMessage.setAttribute("class", "ms-3 small text-secondary");
  responseMessage.setAttribute("id", "successmessage");

  // Gray box
  let grayBox = document.createElement("div");
  grayBox.setAttribute("class", "content-mailbox rounded px-3 py-4");
  grayBox.setAttribute("id", "emailscontainer");

  // Append responseMessage and grayBox to emailsView
  emailsView.append(responseMessage);
  emailsView.append(grayBox);

  // Table
  let table = document.createElement("table");
  table.setAttribute("class", "table table-hover mb-0");

  let tbody = document.createElement("tbody");
  tbody.setAttribute("class", "border-top");

  // Append tbody to table
  table.appendChild(tbody);

  // if (mailbox == "sent") {
  //   table.setAttribute("id", "emailsent");
  // } else if (mailbox == "inbox") {
  //   table.setAttribute("id", "emailinbox");
  // } else {
  //   table.setAttribute("id", "emailarchive");
  // }

// API request
fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
  
      // Not empty
      emails.forEach(email => {
        // email
        let tr = document.createElement("tr");
        tr.setAttribute("type", "button");

        // email > archive
        let tdArchive = document.createElement("td");
        tdArchive.setAttribute("class", "col-1 align-middle");
        let tdArchiveButton = document.createElement("button");
        tdArchiveButton.setAttribute("class", "btn btn-sm btn-danger");
        tdArchiveButton.innerHTML = `<i class="bi bi-archive"></i>`;
        tdArchive.appendChild(tdArchiveButton);

        // email > sender/recipient
        let tdSender = document.createElement("td");
        tdSender.setAttribute("class", "col-3 align-middle");
        if (mailbox == "sent") {
          // let recipientsName = `${email.recipients}`.split("@");
          // tdSender.innerHTML = recipientsName[0].charAt(0).toUpperCase() + recipientsName[0].slice(1);
          tdSender.innerHTML = `${email.recipients}`;
        } else {
          // let senderName = `${email.sender}`.split("@");
          // tdSender.innerHTML = senderName[0].charAt(0).toUpperCase() + senderName[0].slice(1);
          tdSender.innerHTML = `${email.sender}`;
        }
        
        // email > subject
        let tdSubject = document.createElement("td");
        tdSubject.setAttribute("class", "col-6 align-middle");
        tdSubject.innerHTML = `${email.subject}`;

        // email > timestamp
        let tdTimestamp = document.createElement("td");
        tdTimestamp.setAttribute("class", "col-2 align-middle text-end");
        let splitDate = `${email.timestamp}`.split(",");
        tdTimestamp.innerHTML = splitDate[0];
        // tdTimestamp.innerHTML = `${email.timestamp}`;

        tr.appendChild(tdArchive);
        tr.appendChild(tdSender);
        tr.appendChild(tdSubject);
        tr.appendChild(tdTimestamp);

        tbody.appendChild(tr);
      });

      // Empty
      if(emails.length == 0) {
        grayBox.classList.add("text-center");
        grayBox.innerHTML = "No emails";
      }
  });

  // Add table to gray box
  grayBox.appendChild(table);
}

function send() {
  let recipients = document.querySelector("#compose-recipients").value;
  let subject = document.querySelector("#compose-subject").value;
  let body = document.querySelector("#compose-body").value;

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
    let errormessage = document.querySelector("#errormessage"); // in compose mail view
    let successmessage = document.querySelector("#successmessage"); // in sent mailbox view

    let message = document.createElement("span");
    message.setAttribute("class", "ms-3 small");

    if ("message" in result) {
      load_mailbox("sent");
      successmessage.innerHTML = result["message"];
    } else {
      errormessage.innerHTML = result["error"];
    }
});
return false;
}