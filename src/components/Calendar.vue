<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn dark class="mr-4" color="primary" @click="createEvent">New Event</v-btn>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">Today</v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">{{ $refs.calendar.title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <!-- Add Event Dialog -->
      <v-dialog v-model="dialog" :overlay="false" max-width="500px" transition="dialog-transition">
        <v-card>
          <v-card-title class="headline primary white--text" primary-title>Add Event</v-card-title>

          <v-container grid-list-xs>
            <v-form>
              <v-text-field v-model="name" name="name" label="Name" id="id"></v-text-field>
              <v-text-field v-model="details" name="details" label="Details" id="details"></v-text-field>
              <v-text-field v-model="start" name="start" type="date" label="Start" id="start"></v-text-field>
              <v-text-field v-model="end" name="end" type="date" label="End" id="end"></v-text-field>
              <v-text-field v-model="color" name="color" type="color" label="Color" id="color"></v-text-field>
              <v-btn color="error" class="mr-3" @click="dialog = false">Close</v-btn>
              <v-btn color="success" :loading="loading" type="submit" @click.prevent="addEvent">Save</v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn @click="deleteEvent(selectedEvent.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <form v-if="currentlyEditing !== selectedEvent.id">{{ selectedEvent.details }}</form>
              <form v-else>
                <textarea-autosize
                  v-model="selectedEvent.details"
                  type="text"
                  style="width:100%"
                  :min-height="100"
                  placeholder="add note"
                ></textarea-autosize>
              </form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="selectedOpen = false">Close</v-btn>
              <v-btn
                text
                v-if="currentlyEditing !== selectedEvent.id"
                @click.prevent="editEvent(selectedEvent)"
              >Edit</v-btn>
              <v-btn text v-else @click.prevent="updateEvent(selectedEvent)">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { db } from "@/main";
export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: "month",
    loading: false,
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4Day": "4 Days"
    },
    name: null,
    details: null,
    start: null,
    end: null,
    color: "#1976D2",
    currentlyEditing: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    dialog: false
  }),
  mounted() {
    this.getEvents();
  },
  methods: {
    async getEvents() {
      let snapshot = await db.collection("calEvent").get();
      let events = [];
      snapshot.forEach(doc => {
        let appData = doc.data();
        appData.id = doc.id;
        events.push(appData);
      });
      this.events = events;
    },
    async updateEvent(selectedEvent) {
      await db
        .collection("calEvent")
        .doc(this.currentlyEditing)
        .update({
          details: selectedEvent.details
        });
      this.selectedOpen = false;
      this.currentlyEditing = null;
    },
    async addEvent() {
      if (this.name && this.start && this.end) {
        this.loading = true;
        await db.collection("calEvent").add({
          name: this.name,
          details: this.details,
          start: this.start,
          end: this.end,
          color: this.color
        });
        this.dialog = false;
        this.getEvents();
        this.name = "";
        this.details = "";
        this.color = "";
        this.start = "";
        this.end = "";
      } else {
        alert("Name, start and end date are required fields");
      }
    },
    async deleteEvent(selectedEventId) {
      await db
        .collection("calEvent")
        .doc(selectedEventId)
        .delete();
      this.selectedOpen = false;
      this.getEvents();
    },
    createEvent() {
      this.dialog = true;
    },
    getEventColor(event) {
      return event.color;
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    editEvent(selectedEvent) {
      this.currentlyEditing = selectedEvent.id;
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      const events = [];

      const min = new Date(`${start.date}T00:00:00`);
      const max = new Date(`${end.date}T23:59:59`);
      const days = (max.getTime() - min.getTime()) / 86400000;
      const eventCount = this.rnd(days, days + 20);

      for (let i = 0; i < eventCount; i++) {
        const allDay = this.rnd(0, 3) === 0;
        const firstTimestamp = this.rnd(min.getTime(), max.getTime());
        const first = new Date(firstTimestamp - (firstTimestamp % 900000));
        const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
        const second = new Date(first.getTime() + secondTimestamp);

        events.push({
          name: this.events[this.rnd(0, this.events.length - 1)],
          start: first,
          end: second,
          color: this.events[this.rnd(0, this.events.length - 1)],
          timed: !allDay
        });
      }

      this.events = events;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    }
  }
};
</script>