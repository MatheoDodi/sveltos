<script>
  export let meetupData;
  import MeetupItem from "./MeetupItem/MeetupItem.svelte";
</script>

<style>
  .meetups-container {
    padding: 1rem 8rem;
    margin-top: 4rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
    grid-column-gap: 1rem;
    grid-row-gap: 1.5rem;
  }
</style>

<div class="meetups-container">
  {#each meetupData as meetup (meetup.id)}
    <MeetupItem {...meetup} on:toggleModal />
  {/each}
</div>
