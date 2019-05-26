<script>
  import PrimaryButton from "../../../Components/PrimaryButton.svelte";
  import SecondaryButton from "../../../Components/SecondaryButton.svelte";
  export let id, title, subtitle, description, imageUrl, address, contactEmail;

  // Check to see if description is too long
  if (description.split(" ").length > 15) {
    // Trim description
    description =
      description
        .split(" ")
        .slice(0, 16)
        .join(" ") + "...";
  }

  function showMore() {
    description = "Hi!";
  }
</script>

<style>
  article {
    height: 250px;
    display: flex;
    width: 100%;
    background-color: white;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.35s;
  }

  article:hover {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .image {
    flex-basis: 35%;
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
    color: #829ab1;
  }

  .content footer {
    margin-top: auto;
  }
</style>

<article data-id={id}>
  <div class="image" style={`background-image: url(${imageUrl})`} />
  <div class="content">
    <h1>{title}</h1>
    <h2>{subtitle}</h2>
    <p>{description}</p>
    <footer>
      <PrimaryButton onClick={showMore} content="See Details" />
      <SecondaryButton content="Favorite" />
    </footer>
  </div>
</article>
