<script>
  export let content;
  export let handleClick;

  function handleClickEvent(e) {
    handleClick(e);
  }
</script>

<style>
  button {
    border-radius: 4px;
    background: #a368fc;
    color: white;
    padding: 10px 15px;
    border: none;
    font-size: 1rem;
    outline-color: #a368fc;
  }

  button:hover {
    background: #9446ed;
    cursor: pointer;
  }

  button:active {
    background: #8719e0;
  }
</style>

<button on:click|preventDefault={handleClickEvent}>{content}</button>
