<script>
  import PrimaryButton from "../../../Components/PrimaryButton.svelte";
  import SecondaryButton from "../../../Components/SecondaryButton.svelte";
  export let id, title, subtitle, description, imageUrl, address, contactEmail;

  const snapId = id;
  const snapTitle = title;
  const snapSubtitle = subtitle;
  let snapDescription = description;
  const snapImageUrl = imageUrl;
  const snapAddress = address;
  const snapContactEmail = contactEmail;

  // Check to see if description is too long
  if (snapDescription.split(" ").length > 15) {
    // Trim description
    snapDescription =
      description
        .split(" ")
        .slice(0, 16)
        .join(" ") + "...";
  }

  function showMore() {
    snapDescription = "Hi!";
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

  a {
    color: #62b0e8;
  }

  a:hover {
    color: #4098d7;
  }
</style>

<article data-id={snapId}>
  <div class="image" style={`background-image: url(${snapImageUrl})`} />
  <div class="content">
    <h1>{snapTitle}</h1>
    <h2>{snapSubtitle}</h2>
    <p>{snapDescription}</p>
    <a href={`mailto:${snapContactEmail}`}> {snapContactEmail} </a>
    <footer>
      <PrimaryButton onClick={showMore} content="See Details" />
      <SecondaryButton content="Favorite" />
    </footer>
  </div>
</article>
