// ==== CONFIG ====
const CLIENT_ID = "22963410601-aek29etcolf3nkkpifs2mncehj60ta7e.apps.googleusercontent.com";
const API_KEY = "AIzaSyDeyN9bNwa-_CCcHPcRksbg_i0Q4yBvjac";
const CALENDAR_ID = "c_8bb7f80d46484a64298e0c67b6ca7f1580bc73242162874c2b938b882597d270@group.calendar.google.com"; // Team calendar address
const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

// ==== AUTH & API LOADING ====
function startApp() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      scope: SCOPES,
    })
    .then(() => {
      const authInstance = gapi.auth2.getAuthInstance();
      const authorizeButton = document.getElementById("authorize_button");
      const signoutButton = document.getElementById("signout_button");

      authorizeButton.onclick = () => authInstance.signIn();
      signoutButton.onclick = () => authInstance.signOut();

      authInstance.isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(authInstance.isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    document.getElementById("authorize_button").style.display = "none";
    document.getElementById("signout_button").style.display = "inline-block";
    loadCalendar();
  } else {
    document.getElementById("authorize_button").style.display = "inline-block";
    document.getElementById("signout_button").style.display = "none";
  }
}

// ==== CALENDAR SETUP ====
async function loadCalendar() {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    editable: true,

    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        const response = await gapi.client.calendar.events.list({
          calendarId: CALENDAR_ID,
          timeMin: fetchInfo.startStr,
          timeMax: fetchInfo.endStr,
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
        });

        const events = response.result.items.map(event => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));

        successCallback(events);
      } catch (err) {
        console.error("Error fetching events", err);
        failureCallback(err);
      }
    },

    select: async (info) => {
      const title = prompt("Enter event title:");
      if (title) {
        try {
          await gapi.client.calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: {
              summary: title,
              start: { dateTime: info.startStr },
              end: { dateTime: info.endStr },
            },
          });
          calendar.refetchEvents();
        } catch (err) {
          console.error("Error adding event", err);
        }
      }
    },

    eventDrop: async (info) => {
      try {
        await gapi.client.calendar.events.patch({
          calendarId: CALENDAR_ID,
          eventId: info.event.id,
          resource: {
            start: { dateTime: info.event.start.toISOString() },
            end: { dateTime: info.event.end.toISOString() },
          },
        });
      } catch (err) {
        console.error("Error updating event", err);
      }
    },

    eventClick: async (info) => {
      if (confirm(`Delete event '${info.event.title}'?`)) {
        try {
          await gapi.client.calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: info.event.id,
          });
          info.event.remove();
        } catch (err) {
          console.error("Error deleting event", err);
        }
      }
    },
  });

  calendar.render();
}

startApp();
