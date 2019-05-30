<script>
  import { onMount } from "svelte";
  import PrimaryButton from "./PrimaryButton.svelte";
  import SecondaryButton from "./SecondaryButton.svelte";
  import Badge from "./Badge.svelte";

  export let selectedMeetup;
  let meetup = null;

  onMount(() => {
    fetch(
      `http://cors-anywhere.herokuapp.com/api.meetup.com/2/event/${selectedMeetup}?key=655078484b4e2d716365697571b69`
    )
      .then(res => res.json())
      .then(data => {
        meetup = data;
      });
  });
</script>

<style>
  .backdrop {
    height: 110vh;
    position: fixed;
    background: rgba(0, 0, 0, 0.7);
    width: 100%;
    z-index: 20;
    display: flex;
    justify-content: center;
  }

  .modal {
    margin-top: 3rem;
    background: white;
    width: 550px;
    height: 700px;
    border-radius: 5px;
    overflow: hidden;
    overflow-y: scroll;
  }

  .background-image {
    height: 35%;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
  }

  .content {
    padding: 1rem;
    flex-basis: 65%;
    display: flex;
    flex-direction: column;
  }

  .content h1 {
    margin-bottom: 0;
    margin-top: 0;
  }

  .content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: lighter;
  }

  .content footer {
    margin-top: auto;
  }

  a {
    color: #62b0e8;
  }

  a:hover {
    color: #4098d7;
  }
</style>

{#if meetup}
  <div class="backdrop" on:click>
    <div class="modal" on:click={e => e.stopPropagation()}>
      <div
        class="background-image"
        style={`background-image: url(${meetup.photo_url})`} />
      <div class="content">
        <h1> {meetup.name} </h1>
        <h2>{new Date(meetup.time).toString()}</h2>
        {@html meetup.description}
        <a href={meetup.event_url}> {meetup.event_url} </a>
        <footer>
          <PrimaryButton
            onClick={() => console.log('clicked')}
            content="See Details" />
          <SecondaryButton content={'Testing'} on:click={() => {}} />
        </footer>
      </div>
    </div>
  </div>
{:else}
  <div>loading</div>
{/if}
