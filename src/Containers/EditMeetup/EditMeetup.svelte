<script>
  let title = "";
  let subtitle = "";
  let description = "";
  let imageUrl = "";
  let address = "";
  let contactEmail = "";
  let formValid = false;

  function addMeetup() {
    const id = Date.now().toString();
    const newMeetup = {
      id,
      title,
      subtitle,
      description,
      imageUrl,
      address,
      contactEmail,
      favorite: false
    };
    meetups = [newMeetup, ...meetups];
    clearInputs();
  }

  function clearInputs() {
    title = "";
    subtitle = "";
    description = "";
    imageUrl = "";
    address = "";
    contactEmail = "";
  }

  function checkFormValidity() {
    if (
      title.trim() &&
      subtitle.trim() &&
      description.trim() &&
      imageUrl.trim() &&
      address.trim() &&
      address.trim() &&
      contactEmail.trim()
    ) {
      formValid = true;
    } else {
      formValid = false;
    }
  }
</script>

<style>
  form {
    background: white;
    border-radius: 7px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    margin: 0 auto;
    width: 500px;
    padding: 0.2rem 2.5rem 2.5rem 2.5rem;
  }

  form h1 {
    text-align: center;
  }

  .form-control {
    width: 100%;
    position: relative;
    z-index: 2;
    margin-top: 2.6rem;
  }

  input[type="text"] {
    width: 100%;
    font-size: 1rem;
    display: inline-block;
    height: 40px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid lightgray;
    border-radius: 3px;
    padding: 5px 10px 5px 125px;
    transition: all 0.2s ease-out;
  }

  input[type="text"] + label {
    width: 120px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 40px;
    line-height: 40px;
    border-radius: 3px 0 0 3px;
    background: linear-gradient(to bottom right, #829ab1, #9fb3c8);
    color: white;
    padding: 0 10px;
    transform: translateZ(0) translateX(0);
    transition: all 0.3s ease-in;
    transition-delay: 0.2s;
  }

  input[type="text"]:focus + label {
    color: white;
    transform: translateY(-100%) translateX(0%);
    border-radius: 3px 3px 0 0;
    transition: all 0.2s ease-out;
    height: 30px;
    line-height: 30px;
  }

  input[type="text"]:focus {
    padding: 10px;
    transition: all 0.3s ease-out;
    transition-delay: 0.2s;
    border-radius: 0 3px 3px 3px;
  }

  button {
    border-radius: 4px;
    margin-top: 2rem;
    background: #a368fc;
    color: white;
    padding: 13px 15px;
    border: none;
    font-size: 1rem;
    outline-color: #a368fc;
    width: 100%;
  }

  button:hover {
    background: #9446ed;
    cursor: pointer;
  }

  button:active {
    background: #8719e0;
  }

  button:disabled {
    background: #cbd2d9;
  }
</style>

<form on:submit|preventDefault={addMeetup} on:input={checkFormValidity}>
  <h1>Create a Meetup</h1>
  <div class="form-control">
    <input
      on:input={e => (title = e.target.value)}
      value={title}
      type="text"
      name="title" />
    <label for="title">Title</label>
  </div>
  <div class="form-control">
    <input bind:value={subtitle} type="text" name="subtitle" />
    <label for="subtitle">Subtitle</label>
  </div>
  <div class="form-control">
    <input bind:value={description} type="text" name="description" />
    <label for="description">Description</label>
  </div>
  <div class="form-control">
    <input bind:value={imageUrl} type="text" name="imageUrl" />
    <label for="imageUrl">Image URL</label>
  </div>
  <div class="form-control">
    <input bind:value={address} type="text" name="address" />
    <label for="address">Address</label>
  </div>
  <div class="form-control">
    <input bind:value={contactEmail} type="text" name="contactEmail" />
    <label for="contactEmail">Email</label>
  </div>
  <button type="submit" disabled={!formValid}>Create</button>
</form>
