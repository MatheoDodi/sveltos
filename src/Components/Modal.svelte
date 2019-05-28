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
    border-radius: 10px;
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

<div class="backdrop">
  <div class="modal">
    <div
      class="background-image"
      style={`background-image: url(${imageUrl})`} />
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
</div>
