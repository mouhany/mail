document.addEventListener('DOMContentLoaded', function() {

  // Use nav in sidebar to toggle between mailboxes, compose, and send mail
  document.querySelector("#inbox").addEventListener('click', () => {
    load_mailbox('inbox');
  });

  document.querySelector("#sent").addEventListener('click', () => {
    load_mailbox('sent');
  });

  document.querySelector("#archive").addEventListener('click', () => {
    load_mailbox('archive');
  });

  document.querySelector("#compose").addEventListener('click', compose_email);

  document.querySelector("#compose-form").onsubmit = () => {
    send_email();
    // Stop form from submitting
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');
});


////////////////////////////////////////////////////////////////////


function message(elementSelector, sentence) {
  document.querySelector(elementSelector).innerHTML = sentence;
  setTimeout(() => {
    document.querySelector(elementSelector).innerHTML = '';
  }, 3000);
}


function compose_email() {
  // Remove active class in nav when compose button is clicked
  let navs = document.querySelectorAll('.nav-link');
  navs.forEach(nav => {
    nav.classList.remove('active');
  });

  // Delete error message (if any) and reset title
  document.querySelector('#errormessage').innerHTML = "";
  document.querySelector("#compose-title").innerHTML = "New Email";

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = '';
  document.querySelector("#compose-subject").value = '';
  document.querySelector("#compose-body").value = '';
}

// Including reply and archive/unarchive functions
function load_email(id, mailbox) {
  // Show single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  let emailView = document.querySelector('#email-view');
  emailView.setAttribute("class", "content rounded px-3");

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    emailView.innerHTML = `
    <h5 class="fw-semibold mb-4">${email.subject}</h5>
    <div class="row">
        <div class="small col-sm-1">From:</div>
        <div class="small col-sm-6 ms-3">${email.sender}</div>
    </div>
    <div class="row">
        <div class="small col-sm-1">To:</div>
        <div class="small col-sm-6 ms-3">${email.recipients}</div>
    </div>
    <div class="row mb-4">
        <div class="small col-sm-1">Time:</div>
        <div class="small col-sm-6 ms-3">${email.timestamp}</div>
    </div>
    <hr>
    `;

    let body = document.createElement("div");
    body.innerHTML = email.body;

    let line = document.createElement("hr");

    emailView.append(body);
    emailView.append(line);

    // Create button to archive / unarchive email
    if (mailbox !== 'sent') {
      let archiveButton = document.createElement("button");
      archiveButton.setAttribute("class", "btn btn-danger me-5");

      if (mailbox == 'inbox') {
        archiveButton.innerHTML = "Archive";
        archiveButton.addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          });
          load_mailbox('inbox');
          message("#successmessage", "Moved to Archive.");
        })
      } else if (mailbox == 'archive') {
        archiveButton.innerHTML = "Unarchive";
        archiveButton.addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          });
          load_mailbox('inbox');
          message("#successmessage", "Removed from Archive.");
        })
      }
      
      emailView.append(archiveButton);
    }

    // Create button to reply email and add white-space
    body.setAttribute("style", "white-space: pre;");
    
    let replyButton = document.createElement("button");
    replyButton.setAttribute("class", "btn btn-danger");
    replyButton.innerHTML = "Reply";
    
    replyButton.addEventListener('click', () => {
      compose_email();

      document.querySelector("#compose-title").innerHTML = "Reply Email";
      document.querySelector("#compose-recipients").value = email.sender;
      if (email.subject.startsWith("Re: ")) {
        document.querySelector("#compose-subject").value = email.subject;
      } else {
        document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
      }

      let splitDate = email.timestamp.split(",");
      document.querySelector("#compose-body").value = `\n\n\t<<<<<\tOn ${splitDate[0]} at${splitDate[1]} ${email.sender} wrote:\t >>>>>\n\n ${email.body}`;
      document.querySelector("#compose-body").focus();
      document.querySelector("#compose-body").setSelectionRange(0,0);

    })

    emailView.append(replyButton);

  });
}


function load_mailbox(mailbox) {
  // Toggle nav in sidebar
  let navs = document.querySelectorAll('.nav-link');
  let active = document.getElementById(mailbox);

  navs.forEach(nav => {
    nav.classList.remove('active');
  });
  active.classList.add('active');

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  let emailsView = document.querySelector("#emails-view");
  emailsView.innerHTML = `<h3 id="mailbox-title" class="align-middle comfortaa px-3 d-inline-block">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Response message (sent)
  let responseMessage = document.createElement("span");
  responseMessage.setAttribute("class", "ms-3 align-text-bottom small text-secondary");
  responseMessage.setAttribute("id", "successmessage");

  // Gray box
  let emailsContainer = document.createElement("div");
  emailsContainer.setAttribute("class", "content rounded px-3 py-4");
  emailsContainer.setAttribute("id", "emailscontainer");

  emailsView.append(responseMessage);
  emailsView.append(emailsContainer);

  // Table
  let table = document.createElement("table");
  table.setAttribute("class", "table mb-0");
  let tbody = document.createElement("tbody");
  tbody.setAttribute("class", "border-top");

  table.appendChild(tbody);

  // API request
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Empty
    if (emails.length == 0){
      emailsContainer.classList.add("text-center");
      emailsContainer.innerHTML = "No emails.";
    }
    // Not empty
    try {
      emails.forEach(email => {
        let tr = document.createElement("tr");
        tr.setAttribute("type", "button");
        tr.addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          });
          load_email(`${email.id}`, mailbox);
        })

        // Background color for read / unread emails
        if (email.read) {
          tr.setAttribute("class", "read");
        } else {
          tr.setAttribute("class", "fw-semibold");
        }

        // email > sender/recipient
        let tdSender = document.createElement("td");
        tdSender.setAttribute("class", "ps-3 col-3 align-middle text-truncate");
        if (mailbox === "sent") {
          tdSender.innerHTML = `${email.recipients}`;
        } else {
          tdSender.innerHTML = `${email.sender}`;
        }
        
        // email > subject
        let tdSubject = document.createElement("td");
        tdSubject.setAttribute("class", "col-6 align-middle text-truncate");
        tdSubject.innerHTML = `${email.subject} <span class="fw-normal small"> - ${email.body} </span>`;

        // email > timestamp
        let tdTimestamp = document.createElement("td");
        tdTimestamp.setAttribute("class", "pe-3 col-3 align-middle text-end text-truncate");
        let splitDate = `${email.timestamp}`.split(",");
        tdTimestamp.innerHTML = splitDate[0];

        tr.appendChild(tdSender);
        tr.appendChild(tdSubject);
        tr.appendChild(tdTimestamp);

        tbody.appendChild(tr);
      });
    } catch(err) { // just in case
      emailsContainer.classList.add("text-center");
      emailsContainer.innerHTML = "No emails.";
    }
  });

  emailsContainer.appendChild(table);
}


function send_email() {
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
    if ("message" in result) {
      load_mailbox('sent');
      message("#successmessage", result["message"]);
    } else {
      message("#errormessage", result["error"]);
    }
  });
}