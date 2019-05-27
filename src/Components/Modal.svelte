<script>
  import PrimaryButton from "./PrimaryButton.svelte";
  import SecondaryButton from "./SecondaryButton.svelte";
  import Badge from "./Badge.svelte";

  export let favorite,
    title,
    subtitle,
    description,
    imageUrl,
    contactEmail,
    address;

  console.log(title);
</script>

<style>
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

  .content p {
    margin-top: 0;
    margin-bottom: 0;
    color: #829ab1;
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

<div class="modal">
  <div class="background-image" />
  <div class="content">
    <h1>
       {title}
      {#if favorite}
        <Badge>Favorite</Badge>
      {/if}
    </h1>
    <h2>{subtitle}</h2>
    <p>{description}</p>

    <a href={`mailto:${contactEmail}`}> {contactEmail} </a>
    <footer>
      <PrimaryButton
        onClick={() => console.log('clicked')}
        content="See Details" />
      <SecondaryButton
        content={favorite ? 'Remove from Favorites' : 'Favorite'}
        on:click={() => {}} />
    </footer>
  </div>
</div>
