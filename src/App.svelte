<script>
  import { Router, Route } from "svelte-routing";

  import meetupsStore from "./stores/meetupsStore.js";
  import Header from "./Components/Header.svelte";
  import MeetupsList from "./Containers/MeetupsList/MeetupsList.svelte";
  import EditMeetup from "./Containers/EditMeetup/EditMeetup.svelte";
  import Modal from "./Components/Modal.svelte";

  export let url = "";
  let meetups;
  let showModal = false;
  let selectedMeetup = null;

  function handleFavorite(e) {
    const id = e.detail;

    const meetup = meetups.find(mtup => mtup.id === id);
    console.log(meetup);
    meetup.favorite = !meetup.favorite;
    meetups = meetups.slice(0);
  }

  function toggleModal(e) {
    let meetup = {
      title: e.detail.snapTitle,
      subtitle: e.detail.snapSubtitle,
      description: e.detail.snapDescription,
      imageUrl: e.detail.snapImageUrl,
      address: e.detail.snapAddress,
      contactEmail: e.detail.snapContactEmail,
      favorite: e.detail.favorite
    };
    selectedMeetup = { ...meetup };
    showModal = !showModal;
    console.log(selectedMeetup);
  }

  meetupsStore.subscribe(mtps => (meetups = mtps));
</script>

<style>
  main {
    margin-top: 4.5rem;
  }
</style>

<Router {url}>
  <Header />
  <main>
    <Route path="create" component={EditMeetup} />
    <Route path="/">
      {#if showModal}
        <Modal {...selectedMeetup} />
      {/if}
      <MeetupsList
        {meetups}
        on:toggleFavorite={handleFavorite}
        on:toggleModal={toggleModal} />
    </Route>
  </main>
</Router>
