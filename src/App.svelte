<script>
  import { onMount } from "svelte";
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
      description: e.detail.description,
      imageUrl: e.detail.snapImageUrl,
      address: e.detail.snapAddress,
      contactEmail: e.detail.snapContactEmail,
      favorite: e.detail.favorite
    };
    selectedMeetup = { ...meetup };
    showModal = !showModal;
    console.log(selectedMeetup);
  }
  onMount(() => {
    fetch(
      "http://cors-anywhere.herokuapp.com/api.meetup.com/find/upcoming_events?key=655078484b4e2d716365697571b69",
      {
        headers: {
          origin: "x-requested-with"
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        meetups = [...data.events];
        // meetupsStore.update(mtps => {
        //   return [...data.events];
        // });
      })
      .catch(err => console.log(err));
  });
</script>

<style>
  main {
    margin-top: 4rem;
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
      {#if meetups}
        <MeetupsList
          {meetups}
          on:toggleFavorite={handleFavorite}
          on:toggleModal={toggleModal} />
      {/if}
    </Route>
  </main>
</Router>
