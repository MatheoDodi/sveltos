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
    "http://cors-anywhere.herokuapp.com/api.meetup.com/find/upcoming_events?key=655078484b4e2d716365697571b69",
    {
      headers: {
        origin: "x-requested-with"
      }
    }
  )
    .then(res => res.json())
    .then(data => {
      console.log(data);
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
