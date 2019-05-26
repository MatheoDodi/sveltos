<script>
  export let id, title, subtitle, description, imageUrl, address, contactEmail;
</script>

<style>
  article {
    height: 300px;
    display: flex;
    width: 45%;
    background-color: white;
  }

  .image {
    flex-basis: 35%;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
  }

  .content {
    padding: 0.5rem 1rem;
    flex-basis: 65%;
    display: flex;
    flex-direction: column;
  }

  .content h1 {
    margin-bottom: 0;
  }

  .content h2 {
    margin-top: 0;
    color: #9aa5b1;
    font-weight: normal;
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
      <button>Show Details</button>
      <button>Favorite</button>
    </footer>
  </div>
</article>
