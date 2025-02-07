using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManagment : MonoBehaviour
{
    public int points = 0;
    public int lives = 3;

    public static GameManagment S;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        S = this;
    }

    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    public void LoseLife()
    {
        lives -= 1;
        Debug.Log(lives);

        if (lives <= 0)
        {
            GameOver();
        }
    }

    public void GameOver()
    {
        SceneManager.LoadScene("GameOver");
    }
}
