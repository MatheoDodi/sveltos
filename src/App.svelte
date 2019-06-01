<script>
  import { onMount } from "svelte";
  import { Router, Route } from "svelte-routing";

  import meetupsStore from "./stores/meetupsStore.js";
  import Header from "./Components/Header.svelte";
  import MeetupsList from "./Containers/MeetupsList/MeetupsList.svelte";
  import EditMeetup from "./Containers/EditMeetup/EditMeetup.svelte";
  import Modal from "./Components/Modal.svelte";

  export let url = "";
  let showModal = false;
  let selectedMeetup = "";

  function toggleModal(e) {
    selectedMeetup = e.detail;
    showModal = !showModal;
  }

  let getMeetups = fetch(
    "https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey="
  )
    .then(res => res.json())
    .then(data => {
      console.log(data._embedded.events);
      return data.events;
    })
    .catch(err => console.log(err));
</script>

<style>
  main {
    margin-top: 4rem;
  }
</style>

<Router {url}>
  <Header />
  <main>
    <!-- <Route path="create" component={EditMeetup} /> -->
    <Route path="/">
      {#if showModal}
        <Modal {selectedMeetup} on:click={toggleModal} />
      {/if}
      {#await getMeetups}
        <p>Loading...</p>
      {:then meetupData}
        <MeetupsList {meetupData} on:toggleModal={toggleModal} />
      {:catch error}
        <p>{error.message}</p>
      {/await}
    </Route>
  </main>
</Router>
